import {
  type Daimon,
  type DaimonEventMap,
} from "@mjt-services/daimon-common-2025";
import { addRoom } from "../common/addRoom";
import { addContent } from "../common/addContent";
import { Daimons } from "../daimon/Daimons";
import { getConnection } from "../getConnection";
import type { RoomContent } from "./RoomContent";
import { roomContentsToPrompt } from "./roomContentsToPrompt";
import { Messages } from "@mjt-engine/message";
import { getEnv } from "../getEnv";

export const respondAsDaimonToRoomContents = async ({
  roomId,
  daimon,
  roomContents,
  userDaimon,
}: {
  roomId: string;
  daimon: Daimon;
  userDaimon?: Daimon;
  roomContents: RoomContent[];
}) => {
  const assistantName = daimon.chara.data.name ?? "assistant";
  const userName = userDaimon?.chara.data.name ?? "user";
  const vars = {
    user: userName,
    char: assistantName,
  };
  const daimonSystemPrompt = Daimons.daimonToSystemPrompt(daimon, vars);
  const roomContentsPrompt = await roomContentsToPrompt(roomContents);
  const fullSystemPrompt = [
    "# Assistant Description",
    daimonSystemPrompt,
    "# Conversation History",
    roomContentsPrompt,
  ].join("\n");
  const con = await getConnection();
  let finished = false;

  console.log(fullSystemPrompt);

  const { contentId, createdAt } = await addContent({
    creatorId: daimon.id,
    value: "",
  });
  await addRoom({
    contentId,
    parentId: roomId,
  });

  // TODO fix typing on the connectEventListenerToSubjectRoot function
  const foo: DaimonEventMap = {
    stop: "",
  };
  const stopGenerationAbortController = new AbortController();
  const stopEventListenerAbortController = new AbortController();

  return new Promise(async (resolve, reject) => {
    try {
      Messages.connectEventListenerToSubjectRoot<"stop", typeof foo>({
        connection: con.connection,
        subjectRoot: "stop",
        signal: stopEventListenerAbortController.signal,
        listener: async (message) => {
          // console.log("stopping", message);
          stopGenerationAbortController.abort();
          reject(new Error("stopped"));
        },
      });
      const model = daimon.chara.data.extensions?.llm ?? getEnv().DEFAULT_LLM;
      await con.requestMany({
        subject: "textgen.generate",
        signal: stopGenerationAbortController.signal,

        onResponse: async (response) => {
          if (finished) {
            return;
          }
          const text =
            response.text?.replace(new RegExp(`^ *${assistantName}: *`), "") ??
            "";
          console.log(text);
          if (response.done) {
            finished = true;
            await addContent({
              creatorId: daimon.id,
              value: text,
              contentId,
              createdAt,
              finalized: true,
            });
            resolve(contentId);
            return;
          }
          await addContent({
            creatorId: daimon.id,
            value: text,
            contentId,
            createdAt,
            finalized: false,
          });
        },
        request: {
          body: {
            model,
            stream: true,
            messages: [
              {
                role: "system",
                content: fullSystemPrompt,
              },
              {
                role: "user",
                content: `Give ${assistantName}'s next response. Begin with '${assistantName}:'`,
              },
            ],
          },
        },
      });
    } catch (error) {
      console.log("error in respondAsDaimonToRoomContents", error);
      reject(error);
    } finally {
      stopEventListenerAbortController.abort();
    }
  });
};
