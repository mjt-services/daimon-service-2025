import { isUndefined, isDefined } from "@mjt-engine/object";
import { type Room, ROOM_OBJECT_STORE } from "@mjt-services/daimon-common-2025";
import { Datas } from "@mjt-services/data-common-2025";
import { getConnection } from "../getConnection";
import { findRoomChildren } from "./findRoomChildren";
import type { RoomContent } from "./RoomContent";
import { roomsToRoomContents } from "./roomsToRoomContents";

/** think stairsteps, this is rooms _above_ the current room in the timeline */

export const findPriorTimelineSiblings = async (
  roomId?: string
): Promise<RoomContent[]> => {
  if (isUndefined(roomId)) {
    return [];
  }

  const room = (await Datas.get(await getConnection())<Room>({
    objectStore: ROOM_OBJECT_STORE,
    key: roomId,
  })) as Room;
  const { parentId } = room ?? {};
  if (isUndefined(parentId)) {
    return [];
  }
  const currentRoomContent = (await roomsToRoomContents([room]))[0];
  if (isUndefined(currentRoomContent) ||
    isUndefined(currentRoomContent.content)) {
    return [];
  }
  const siblings = await findRoomChildren(parentId);

  const siblingRoomContents = await roomsToRoomContents(siblings);
  const priors = siblingRoomContents.filter(
    (sibling) => (sibling?.content?.createdAt ?? 0) <
      (currentRoomContent.content?.createdAt ?? 0)
  );
  const parentParentId = currentRoomContent.room.parentId;
  const parentParentRoomContents = isDefined(parentParentId)
    ? await findPriorTimelineSiblings(parentParentId)
    : [];

  return [...priors, currentRoomContent, ...parentParentRoomContents];
};
