import { isUndefined, isDefined } from "@mjt-engine/object";
import { findDaimonsByRoom } from "./findDaimonsByRoom";
import { findRoomChildren } from "./findRoomChildren";
import { lastRoomContent } from "./lastRoomContent";
import { respondAsDaimonToRoomContents } from "./respondAsDaimonToRoomContents";
import { roomsToRoomContents } from "./roomsToRoomContents";

export const handleRoomUpdate = async (roomId: string) => {
  const roomChildren = await findRoomChildren(roomId);
  const roomContents = await roomsToRoomContents(roomChildren);
  const last = lastRoomContent(roomContents);
  if (isUndefined(last)) {
    return;
  }
  if (isDefined(last.content?.creatorId)) {
    return;
  }
  const daimons = (await findDaimonsByRoom(roomId)).toSorted((a, b) => {
    if (a.chara.data.name && b.chara.data.name) {
      return a.chara.data.name.localeCompare(b.chara.data.name);
    }
    return 0;
  });
  for (const daimon of daimons) {
    const roomChildren = await findRoomChildren(roomId);
    const roomContents = await roomsToRoomContents(roomChildren);
    await respondAsDaimonToRoomContents({
      roomId,
      daimon,
      roomContents,
    });
  }
};
