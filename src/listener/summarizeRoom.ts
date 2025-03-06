import { Asserts } from "@mjt-engine/assert";
import { ask } from "../common/ask";
import { MESSAGE_CONTENT_TYPE } from "../common/MESSAGE_CONTENT_TYPE";
import { getEnv } from "../getEnv";
import { findRoomContents } from "./findRoomContents";
import { SUMMARY_CONTENT_TYPE } from "./SUMMARY_CONTENT_TYPE";
import { addContent } from "../common/addContent";
import { addRoom } from "../common/addRoom";
import { getSummaryChunkSize } from "./getSummaryChunkSize";

export const summarizeRoom = async (roomId: string) => {
  const roomContents = await findRoomContents(roomId);
  const { chunkSize, overlapSize } = getSummaryChunkSize();

  const idxOfLastSummary = roomContents.findLastIndex(
    (c) => c.content?.contentType === SUMMARY_CONTENT_TYPE
  );
  if (idxOfLastSummary >= roomContents.length - chunkSize) {
    return;
  }
  const sumarizableContents = roomContents.filter(
    (c) => c.content?.contentType == MESSAGE_CONTENT_TYPE
  );

  const chunkContents = sumarizableContents.slice(
    Math.max(0, sumarizableContents.length - chunkSize - overlapSize),
    sumarizableContents.length
  );
  console.log(
    "Chunk contents: ",
    chunkContents.map((c) => c.content?.value)
  );

  const model = Asserts.assertValue(getEnv().SUMMARY_LLM);
  const summary = await ask({
    model,
    systemMessage: chunkContents.map((c) => c.content?.value).join("\n"),
    userMessage:
      "Summarize the conversation as briefly as possible. Be sure to include the most important points.",
  });
  console.log("Summary: ", summary);
  const { contentId } = await addContent({
    value: summary,
    contentType: SUMMARY_CONTENT_TYPE,
    finalized: true,
  });
  return addRoom({
    contentId,
    parentId: roomId,
  });
};
