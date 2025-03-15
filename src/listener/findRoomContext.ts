import { isUndefined } from "@mjt-engine/object";
import type { Room, Content } from "@mjt-services/daimon-common-2025";
import { Datas } from "@mjt-services/data-common-2025";
import { getConnection } from "../getConnection";


export const findRoomContext = async (roomId: string) => {
  const room = (await Datas.get(await getConnection())({
    key: roomId,
  })) as Room;
  if (isUndefined(room.contextId)) {
    return;
  }
  return (await Datas.get(await getConnection())({
    key: room.contextId,
  })) as Content;
};
