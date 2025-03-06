import { findRoomChildren } from "./findRoomChildren";
import { roomsToRoomContents } from "./roomsToRoomContents";


export const findRoomContents = async (roomId: string) => {
  const roomChildren = await findRoomChildren(roomId);
  return roomsToRoomContents(roomChildren);
};
