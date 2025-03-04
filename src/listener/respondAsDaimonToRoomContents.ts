import { type Daimon } from "@mjt-services/daimon-common-2025";
import { AddRoom } from "../common/AddRoom";
import { addTextContent } from "../common/addTextContent";
import { Daimons } from "../daimon/Daimons";
import { getConnection } from "../getConnection";
import type { RoomContent } from "./RoomContent";
import { roomContentsToPrompt } from "./roomContentsToPrompt";

export const respondAsDaimonToRoomContents = async ({
  roomId,
  daimon,
  roomContents,
}: {
  roomId: string;
  daimon: Daimon;
  roomContents: RoomContent[];
}) => {
  const daimonSystemPrompt = Daimons.daimonToSystemPrompt(daimon);
  const roomContentsPrompt = await roomContentsToPrompt(roomContents);
  const fullSystemPrompt = [
    "# Assistant Description",
    daimonSystemPrompt,
    "# Conversation History",
    roomContentsPrompt,
  ].join("\n");
  const con = await getConnection();
  const assistantName = daimon.chara.data.name ?? "assistant";
  let finished = false;

  const { contentId, createdAt } = await addTextContent({
    creatorId: daimon.id,
    text: "",
  });
  await AddRoom({
    contentId,
    parentId: roomId,
  });

  return new Promise((resolve, reject) => {
    con.requestMany({
      subject: "textgen.generate",
      onResponse: async (response) => {
        if (finished) {
          return;
        }
        if (response.done) {
          finished = true;
          await addTextContent({
            creatorId: daimon.id,
            text: response.text ?? "",
            contentId,
            createdAt,
            finalized: true,
          });
          resolve(contentId);
          return;
        }
        await addTextContent({
          creatorId: daimon.id,
          text: response.text ?? "",
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
          model: "gryphe/mythomax-l2-13b",
          stream: true,
          messages: [
            {
              role: "system",
              content: fullSystemPrompt,
            },
            {
              role: "user",
              content: `Give ${assistantName} next response. Begin with '${assistantName}: '`,
            },
          ],
        },
      },
    });
  });
};
