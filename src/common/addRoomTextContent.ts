import {
  CONTENT_OBJECT_STORE,
  ROOM_OBJECT_STORE,
  type Content,
  type Room,
} from "@mjt-services/daimon-common-2025";
import { Datas, Ids } from "@mjt-services/data-common-2025";
import { getConnection } from "../getConnection";

export const addRoomTextContent = async ({
  text,
  parentId,
  creatorId,
}: {
  parentId?: string;
  text: string;
  creatorId: string;
}) => {
  const id = Ids.fromObjectStore(ROOM_OBJECT_STORE);
  const content: Content = {
    id: Ids.fromObjectStore(CONTENT_OBJECT_STORE),
    contentType: "plain/text",
    value: text,
    creatorId,
    createdAt: Date.now(),
  };
  await Datas.put(await getConnection())({
    value: content,
  });
  await Datas.put(await getConnection())({
    objectStore: ROOM_OBJECT_STORE,
    value: {
      id,
      parentId,
      contentId: content.id,
    } as Partial<Room>,
  });
  return id;
};
