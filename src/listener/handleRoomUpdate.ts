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
  const daimons = (await findDaimonsByRoom(roomId)).toSorted((a, b) => {
    if (a.chara.data.name && b.chara.data.name) {
      return a.chara.data.name.localeCompare(b.chara.data.name);
    }
    return 0;
  });
  console.log("Daimons: ", daimons);
  const userDaimon = daimons.find((d) => d.chara.data.extensions?.isUser);
  console.log("User daimon: ", userDaimon);

  if (last.content?.creatorId !== userDaimon?.id) {
    console.log("skipping, last content creator is not user daimon", {
      lastCreator: last.content?.creatorId,
      userDaimonId: userDaimon?.id,
    });
    return;
  }
  for (const daimon of daimons) {
    if (daimon.chara.data.extensions?.isUser) {
      console.log("Skipping user daimon: ", daimon);
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
