import { Asserts } from "@mjt-engine/assert";
import { isDefined } from "@mjt-engine/object";
import { addContent } from "../common/addContent";
import { addRoom } from "../common/addRoom";
import { ask } from "../common/ask";
import { MESSAGE_CONTENT_TYPE } from "../common/MESSAGE_CONTENT_TYPE";
import { getEnv } from "../getEnv";
import { askDaimon } from "./askDaimon";
import { findRoomContents } from "./findRoomContents";
import { getSummaryChunkSize } from "./getSummaryChunkSize";
import { SUMMARY_CONTENT_TYPE } from "./SUMMARY_CONTENT_TYPE";
import { updateRootRoomSummary } from "./updateRootRoomSummary";

export const addRoomSummary = async ({
  roomId,
  query,
}: {
  roomId: string;
  query: string;
}) => {
  const roomContents = await findRoomContents(roomId);
  const { chunkSize, overlapSize } = getSummaryChunkSize();
  const shortSummaryQuery =
    "Summarize the conversation in 3 to 5 words, no quotes, no punctuation. This is for the name of conversation so that the user can easily find it later.";
  if (roomContents.length === 2) {
    const shortSummary = await askDaimon({
      query: shortSummaryQuery,
      roomId,
      assistant: {
        chara: {
          data: {
            name: "Summarizer",
            description: "An expert summarization service",
          },
          spec: "chara_card_v2",
          spec_version: "",
        },
      },
    });
    if (isDefined(shortSummary)) {
      await updateRootRoomSummary({
        roomId,
        summary: shortSummary.value,
      });
    }
  }

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

  const model = Asserts.assertValue(getEnv().SUMMARY_LLM);
  const summary = await ask({
    model,
    systemMessage: chunkContents.map((c) => c.content?.value).join("\n"),
    userMessage: query,
  });

  const { contentId } = await addContent({
    value: summary,
    contentType: SUMMARY_CONTENT_TYPE,
    finalized: true,
  });
  await addRoom({
    contentId,
    parentId: roomId,
  });

  const shortSummary = await ask({
    userMessage: shortSummaryQuery,
    systemMessage: summary,
  });
  if (isDefined(shortSummary)) {
    await updateRootRoomSummary({
      roomId,
      summary: shortSummary,
    });
  }
};
