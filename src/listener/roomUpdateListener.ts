import { Messages } from "@mjt-engine/message";
import { type DATA_EVENT_MAP } from "@mjt-services/data-common-2025";
import { getConnection } from "../getConnection";
import { handleRoomUpdate } from "./handleRoomUpdate";
import { addRoomSummary } from "./addRoomSummary";
import { updateRootRoomSummary } from "./updateRootRoomSummary";
import { askDaimon } from "./askDaimon";

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
      await addRoomSummary({
        roomId: parentId,
        query:
          "Summarize the conversation as briefly as possible. Be sure to include the most important points.",
      });

    },
  });
};
