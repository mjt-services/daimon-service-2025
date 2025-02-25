import type { RoomContent } from "./RoomContent";


export const lastRoomContent = (
  roomContents: RoomContent[]
): RoomContent | undefined => {
  return roomContents.reduce((acc, roomContent) => {
    if (roomContent.content &&
      acc.content &&
      roomContent.content.createdAt > acc.content.createdAt) {
      return roomContent;
    }
    return acc;
  });
};
