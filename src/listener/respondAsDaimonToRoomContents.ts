import {
  type Daimon,
  type DaimonEventMap,
} from "@mjt-services/daimon-common-2025";
import { AddRoom } from "../common/AddRoom";
import { addTextContent } from "../common/addTextContent";
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

  const { contentId, createdAt } = await addTextContent({
    creatorId: daimon.id,
    text: "",
  });
  await AddRoom({
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
      console.log(
        "respondAsDaimonToRoomContents: connectEventListenerToSubjectRoot"
      );
      Messages.connectEventListenerToSubjectRoot<"stop", typeof foo>({
        connection: con.connection,
        subjectRoot: "stop",
        signal: stopEventListenerAbortController.signal,
        listener: async (message) => {
          console.log("stopping", message);
          stopGenerationAbortController.abort();
          reject(new Error("stopped"));
        },
      });
      console.log("respondAsDaimonToRoomContents: requestMany");
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
            await addTextContent({
              creatorId: daimon.id,
              text,
              contentId,
              createdAt,
              finalized: true,
            });
            resolve(contentId);
            return;
          }
          await addTextContent({
            creatorId: daimon.id,
            text,
            contentId,
            createdAt,
            finalized: false,
          });
        },
        request: {
          body: {
            // model: "google/gemini-2.0-flash-001",
            // model: "mistralai/mistral-nemo",
            // model: "google/gemini-flash-1.5",
            // model: "gryphe/mythomax-l2-13b",
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
      console.log("wrapping up respondAsDaimonToRoomContents");
      stopEventListenerAbortController.abort();
    }
  });
};
