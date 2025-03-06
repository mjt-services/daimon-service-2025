import { isDefined, isUndefined } from "@mjt-engine/object";
import { getAllDaimons } from "./getAllDaimons";
import type { RoomContent } from "./RoomContent";
import { MESSAGE_CONTENT_TYPE } from "../common/MESSAGE_CONTENT_TYPE";
import { SUMMARY_CONTENT_TYPE } from "./SUMMARY_CONTENT_TYPE";
import { getSummaryChunkSize } from "./getSummaryChunkSize";
import { sortByCreatedAt } from "./sortByCreatedAt";

export const roomContentsToPrompt = async (roomContents: RoomContent[]) => {
  const allDaimons = await getAllDaimons();

  const { chunkSize } = getSummaryChunkSize();

  const summaryPrompt = roomContents
    .filter(
      ({ content }) =>
        isDefined(content) && content.contentType === SUMMARY_CONTENT_TYPE
    )
    .toSorted(sortByCreatedAt)
    .map(({ content }) => {
      const { value } = content!;
      return value;
    })
    .join("\n");

  const messagesPrompt = roomContents
    .filter(
      ({ content }) =>
        isDefined(content) && content.contentType === MESSAGE_CONTENT_TYPE
    )
    .toSorted(sortByCreatedAt)
    .slice(-chunkSize)
    .map(({ content }) => {
      const { value, creatorId } = content!;
      const daimon = allDaimons.find((daimon) => daimon.id === creatorId);
      const speakerName = daimon?.chara.data.name ?? "user";
      return `${speakerName}: ${value}`;
    })
    .join("\n");
  return [summaryPrompt, messagesPrompt].join("\n\n");
};
