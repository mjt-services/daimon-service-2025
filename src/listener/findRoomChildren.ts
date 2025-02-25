import { ROOM_OBJECT_STORE, type Room } from "@mjt-services/daimon-common-2025";
import { Datas } from "@mjt-services/data-common-2025";
import { getConnection } from "../getConnection";


export const findRoomChildren = async (roomId: string) => {
  return Datas.search(await getConnection())({
    from: ROOM_OBJECT_STORE,
    query: `values(@)[?parentId=='${roomId}']`,
  }) as Promise<Room[]>;
};
