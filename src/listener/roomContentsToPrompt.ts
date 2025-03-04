import { isUndefined, isDefined } from "@mjt-engine/object";
import { getAllDaimons } from "./getAllDaimons";
import { undefined } from "./respondAsDaimonToRoomContents";
import type { RoomContent } from "./RoomContent";


export const roomContentsToPrompt = async (roomContents: RoomContent[]) => {
  const allDaimons = await getAllDaimons();
  return roomContents
    .toSorted((a, b) => {
      if (isUndefined(a.content) || isUndefined(b.content)) {
        return 0;
      }
      return a.content.createdAt - b.content.createdAt;
    })
    .map(({ room, content }) => {
      if (isUndefined(content)) {
        console.log(`Content undefined in room ${room.id}`);
        return undefined;
      }
      const { contentType, value, creatorId } = content;
      const daimon = allDaimons.find((daimon) => daimon.id === creatorId);
      if (typeof value !== "string") {
        console.log(`Content not text/plain in room ${room.id}`);
        return undefined;
      }
      const speakerName = daimon?.chara.data.name ?? "user";
      return `${speakerName}: ${value}`;
    })
    .filter(isDefined)
    .join("\n");
};
