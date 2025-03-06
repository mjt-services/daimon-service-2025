import { isUndefined } from "@mjt-engine/object";
import { findDaimonsByRoom } from "./findDaimonsByRoom";
import { findRoomChildren } from "./findRoomChildren";
import { lastRoomMessageContent } from "./lastRoomContent";
import { respondAsDaimonToRoomContents } from "./respondAsDaimonToRoomContents";
import { roomsToRoomContents } from "./roomsToRoomContents";
import { findRoomContents } from "./findRoomContents";

export const handleRoomUpdate = async (roomId: string) => {
  const roomContents = await findRoomContents(roomId);
  const last = lastRoomMessageContent(roomContents);
  if (isUndefined(last)) {
    return;
  }
  const daimons = (await findDaimonsByRoom(roomId)).toSorted((a, b) => {
    if (a.chara.data.name && b.chara.data.name) {
      return a.chara.data.name.localeCompare(b.chara.data.name);
    }
    return 0;
  });
  const userDaimon = daimons.find((d) => d.chara.data.extensions?.isUser);

  if (last.content?.creatorId !== userDaimon?.id) {
    return;
  }
  for (const daimon of daimons) {
    if (daimon.chara.data.extensions?.isUser) {
      continue;
    }
    const roomChildren = await findRoomChildren(roomId);
    const roomContents = await roomsToRoomContents(roomChildren);
    await respondAsDaimonToRoomContents({
      roomId,
      daimon,
      userDaimon,
      roomContents,
    });
  }
};
