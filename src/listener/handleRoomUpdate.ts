import { isUndefined } from "@mjt-engine/object";
import { Daimons, Rooms } from "@mjt-services/daimon-common-2025";
import { getConnection } from "../getConnection";
import { respondAsDaimonToRoomContents } from "./respondAsDaimonToRoomContents";

export const handleRoomUpdate = async (roomId: string) => {
  const con = await getConnection();
  const roomContents = await Rooms.findRoomContents(con)(roomId);
  const last = Rooms.lastRoomMessageContent(roomContents);
  if (isUndefined(last)) {
    console.log("no last message");
    return;
  }
  const daimons = (await Daimons.findDaimonsByRoom(con)(roomId)).toSorted(
    (a, b) => {
      if (a.chara.data.name && b.chara.data.name) {
        return a.chara.data.name.localeCompare(b.chara.data.name);
      }
      return 0;
    }
  );
  const userDaimon = daimons.find((d) => d.chara.data.extensions?.isUser);
  if (isUndefined(userDaimon)) {
    console.log("no user daimon");
    return;
  }

  if (last.content?.creatorId !== userDaimon?.id) {
    console.log("user is not the last message");
    return;
  }
  for (const daimon of daimons) {
    if (daimon.chara.data.extensions?.isUser) {
      console.log("skipping user daimon");
      continue;
    }
    await respondAsDaimonToRoomContents({
      roomId,
      daimon,
      userDaimon,
    });
    console.log(`responded as ${daimon.chara.data.name}`);
  }
};
