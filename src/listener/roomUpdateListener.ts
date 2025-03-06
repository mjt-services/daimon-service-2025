import { Messages } from "@mjt-engine/message";
import { type DATA_EVENT_MAP } from "@mjt-services/data-common-2025";
import { getConnection } from "../getConnection";
import { handleRoomUpdate } from "./handleRoomUpdate";
import { summarizeRoom } from "./summarizeRoom";

export const roomUpdateListener = async () => {
  Messages.connectEventListenerToSubjectRoot<
    "update",
    typeof DATA_EVENT_MAP,
    Record<string, string>
  >({
    connection: (await getConnection()).connection,
    subjectRoot: "update",
    listener: async (event) => {
      const { root, subpath: parentId } = Messages.parseSubject(event.subject);
      await handleRoomUpdate(parentId);
      const summaryRoomId = await summarizeRoom(parentId);
      console.log("Summary room id: ", summaryRoomId);
    },
  });
};
