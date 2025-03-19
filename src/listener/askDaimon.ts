import { isDefined } from "@mjt-engine/object";
import type {
  BaseDaimon,
  Content,
  Daimon,
  DaimonConnectionMap,
} from "@mjt-services/daimon-common-2025";
import { Datas, isEntity } from "@mjt-services/data-common-2025";
import { Daimons } from "../daimon/Daimons";
import { getConnection } from "../getConnection";
import { getEnv } from "../getEnv";
import { findDaimonsByRoom } from "./findDaimonsByRoom";
import { findPriorTimelineSiblings } from "./findPriorTimelineSiblings";
import { findRoomChildren } from "./findRoomChildren";
import { findRoomContext } from "./findRoomContext";
import { roomContentsToPrompt } from "./roomContentsToPrompt";
import { roomsToRoomContents } from "./roomsToRoomContents";

export const askDaimon = async (
  props: DaimonConnectionMap["daimon.ask"]["request"]["body"] & {
    signal?: AbortSignal;
    assistant?: BaseDaimon;
    onUpdate?: (content: Partial<Content>) => void | Promise<void>;
    responseTextMapper?: (text: string) => string;
  }
) => {
  const {
    roomId,
    query,
    assistantId,
    userId,
    signal,
    onUpdate,
    responseTextMapper = (text) => text,
    maxTokens = 2048,
    assistant,
  } = props;

  const daimons = isDefined(roomId)
    ? (await findDaimonsByRoom(roomId)).toSorted((a, b) => {
        if (a.chara.data.name && b.chara.data.name) {
          return a.chara.data.name.localeCompare(b.chara.data.name);
        }
        return 0;
      })
    : [];
  const userDaimon = isDefined(userId)
    ? (await Datas.get(await getConnection())({ key: userId }))
      ? daimons.find((d) => d.chara.data.extensions?.isUser)
      : undefined
    : undefined;

  const assistantDaimon = isDefined(assistantId)
    ? ((await Datas.get(await getConnection())({ key: assistantId })) as Daimon)
    : assistant;
  console.log("assistant DAIMON", assistantDaimon);
  const roomChildren = isDefined(roomId) ? await findRoomChildren(roomId) : [];
  const roomContents = await roomsToRoomContents(roomChildren);

  const priorTimelineSiblinRoomContents = await findPriorTimelineSiblings(
    roomId
  );

  const assistantName = assistantDaimon?.chara?.data.name ?? "assistant";
  const userName = userDaimon?.chara.data.name ?? "user";
  const vars = {
    user: userName,
    char: assistantName,
  };

  const daimonSystemPrompt = isDefined(assistantDaimon)
    ? Daimons.daimonToSystemPrompt(assistantDaimon, vars)
    : undefined;
  const roomContentsPrompt = await roomContentsToPrompt([
    ...priorTimelineSiblinRoomContents,
    ...roomContents,
  ]);
  const roomContextPrompt = isDefined(roomId)
    ? (await findRoomContext(roomId))?.value
    : undefined;

  const fullSystemPrompt = [
    roomContextPrompt,
    "# Assistant Description",
    daimonSystemPrompt,
    "# Conversation History",
    roomContentsPrompt,
  ]
    .filter(isDefined)
    .join("\n");

  const con = await getConnection();
  console.log(fullSystemPrompt);

  const model =
    assistantDaimon?.chara?.data?.extensions?.llm ?? getEnv().DEFAULT_LLM;
  let finished = false;
  const createdAt = Date.now();
  const creatorId = isEntity(assistantDaimon) ? assistantDaimon?.id : undefined;
  return new Promise<Partial<Content>>(async (resolve, reject) => {
    try {
      await con.requestMany({
        subject: "textgen.generate",
        signal,
        options: {
          timeoutMs: 1000 * 60 * 5,
        },

        onResponse: async (response) => {
          if (finished) {
            return;
          }
          const text = responseTextMapper(response.text ?? "");
          const content: Partial<Content> = {
            creatorId,
            value: text,
            createdAt,
            updatedAt: Date.now(),
            finalized: response.done,
          };
          await onUpdate?.(content);
          if (response.done) {
            finished = true;
            resolve(content);
            return;
          }
        },
        request: {
          body: {
            model,
            stream: true,
            max_tokens: maxTokens,
            messages: [
              {
                role: "system",
                content: fullSystemPrompt,
              },
              {
                role: "user",
                content: query,
              },
            ],
          },
        },
      });
    } catch (error) {
      reject(error);
    }
  });
};
