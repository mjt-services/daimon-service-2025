import { isUndefined } from "@mjt-engine/object";
import type { RoomContent } from "./RoomContent";


export const sortByCreatedAt = (a: RoomContent, b: RoomContent): number => {
  if (isUndefined(a.content) || isUndefined(b.content)) {
    return 0;
  }
  return a.content.createdAt - b.content.createdAt;
};
