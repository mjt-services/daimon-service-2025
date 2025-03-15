import { isDefined } from "@mjt-engine/object";
import type {
  DaimonConnectionMap,
  Content,
} from "@mjt-services/daimon-common-2025";
import { Datas } from "@mjt-services/data-common-2025";
import { Daimons } from "../daimon/Daimons";
import { getConnection } from "../getConnection";
import { getEnv } from "../getEnv";
import { findDaimonsByRoom } from "./findDaimonsByRoom";
import { findRoomChildren } from "./findRoomChildren";
import { findRoomContext } from "./findRoomContext";
import { roomContentsToPrompt } from "./roomContentsToPrompt";
import { roomsToRoomContents } from "./roomsToRoomContents";

export const askDaimon = async (
  props: DaimonConnectionMap["daimon.ask"]["request"]["body"] & {
    signal?: AbortSignal;
    onUpdate: (content: Partial<Content>) => void | Promise<void>;
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
    ? (await Datas.get(await getConnection())({ key: assistantId }))
      ? daimons.find((d) => !d.chara.data.extensions?.isUser)
      : undefined
    : undefined;

  const roomChildren = isDefined(roomId) ? await findRoomChildren(roomId) : [];
  const roomContents = await roomsToRoomContents(roomChildren);

  const assistantName = assistantDaimon?.chara.data.name ?? "assistant";
  const userName = userDaimon?.chara.data.name ?? "user";
  const vars = {
    user: userName,
    char: assistantName,
  };

  const daimonSystemPrompt = isDefined(assistantDaimon)
    ? Daimons.daimonToSystemPrompt(assistantDaimon, vars)
    : undefined;
  const roomContentsPrompt = await roomContentsToPrompt(roomContents);
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

  const model =
    assistantDaimon?.chara.data.extensions?.llm ?? getEnv().DEFAULT_LLM;
  let finished = false;
  const createdAt = Date.now();
  return new Promise(async (resolve, reject) => {
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
        console.log(text);
        if (response.done) {
          finished = true;
          await onUpdate({
            creatorId: assistantDaimon?.id,
            value: text,
            createdAt,
            updatedAt: Date.now(),
            finalized: true,
          });
          resolve(response);
          return;
        }
        await onUpdate({
          creatorId: assistantDaimon?.id,
          value: text,
          createdAt,
          updatedAt: Date.now(),
          finalized: false,
        });
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
  });
};
