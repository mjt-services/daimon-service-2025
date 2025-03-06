import { ROOM_OBJECT_STORE, type Room } from "@mjt-services/daimon-common-2025";
import { Datas, Ids } from "@mjt-services/data-common-2025";
import { getConnection } from "../getConnection";


export const addRoom = async ({
  parentId, contentId,
}: {
  contentId: string;
  parentId?: string;
}) => {
  await Datas.put(await getConnection())({
    objectStore: ROOM_OBJECT_STORE,
    value: {
      id: Ids.fromObjectStore(ROOM_OBJECT_STORE),
      parentId,
      contentId,
    } as Partial<Room>,
  });
};
