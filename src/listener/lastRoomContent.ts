import { MESSAGE_CONTENT_TYPE } from "../common/MESSAGE_CONTENT_TYPE";
import type { RoomContent } from "./RoomContent";

export const lastRoomMessageContent = (
  roomContents: RoomContent[]
): RoomContent | undefined => {
  return roomContents.reduce((acc, roomContent) => {
    if (
      roomContent.content &&
      roomContent.content?.contentType == MESSAGE_CONTENT_TYPE &&
      acc.content &&
      roomContent.content.createdAt > acc.content.createdAt
    ) {
      return roomContent;
    }
    return acc;
  });
};
