import { isDefined, isUndefined } from "@mjt-engine/object";
import type { Content, Room } from "@mjt-services/daimon-common-2025";
import { Datas } from "@mjt-services/data-common-2025";
import { getConnection } from "../getConnection";

export const updateRootRoomSummary = async ({
  roomId,
  summary,
}: {
  roomId: string;
  summary?: unknown;
}) => {
  const room = (await Datas.get(await getConnection())({
    key: roomId,
  })) as Room;

  if (isUndefined(room)) {
    console.log("room is undefined");
    return;
  }
  if (isDefined(room.parentId)) {
    console.log("room.parentId is defined");
    return;
  }

  const currentRootRoomContent = (await Datas.get(await getConnection())({
    key: room.contentId,
  })) as Content;
  if (isUndefined(currentRootRoomContent)) {
    console.log("currentRootRoomContent is undefined");
    return;
  }

  await Datas.put(await getConnection())({
    value: {
      ...currentRootRoomContent,
      value: summary,
    } satisfies Partial<Content>,
  });
};
