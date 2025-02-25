import { type Room, type Content, CONTENT_OBJECT_STORE } from "@mjt-services/daimon-common-2025";
import { Datas } from "@mjt-services/data-common-2025";
import { getConnection } from "../getConnection";
import type { RoomContent } from "./RoomContent";


export const roomsToRoomContents = (rooms: Room[]): Promise<RoomContent[]> => {
  return Promise.all(
    rooms.map(async (room) => {
      const content = await Datas.get(await getConnection())<Content>({
        objectStore: CONTENT_OBJECT_STORE,
        key: room.contentId,
      });
      return { room, content };
    })
  );
};
