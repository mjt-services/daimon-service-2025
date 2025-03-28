import { Asserts } from "@mjt-engine/assert";
import { Messages } from "@mjt-engine/message";
import type { MessageConnectionInstance } from "@mjt-engine/message/dist/createConnection";
import { Rooms } from "@mjt-services/daimon-common-2025";
import {
  type DATA_EVENT_MAP,
  type DataConnectionMap,
} from "@mjt-services/data-common-2025";
import type { TextgenConnectionMap } from "@mjt-services/textgen-common-2025";
import { getEnv } from "../getEnv";
import { handleRoomUpdate } from "./handleRoomUpdate";

export const roomUpdateListener =
  <M extends DataConnectionMap & TextgenConnectionMap>(
    con: MessageConnectionInstance<M>
  ) =>
  async () => {
    console.log("roomUpdateListener init");
    return Messages.connectEventListenerToSubjectRoot<
      "update",
      typeof DATA_EVENT_MAP,
      Record<string, string>
    >({
      connection: con.connection,
      subjectRoot: "update",
      listener: async (event) => {
        try {
          const { subject } = event;
          console.log(`roomUpdateListener event subject: ${subject}`);
          const { root, subpath: parentId } = Messages.parseSubject(subject);
          console.log(`roomUpdateListener event parentId: ${parentId}`);
          await handleRoomUpdate(parentId);
          await Rooms.addRoomSummary(con)({
            roomId: parentId,
            query:
              "Summarize the conversation as briefly as possible. Be sure to include the most important points.",
            chunkSize: parseInt(
              Asserts.assertValue(getEnv().SUMMARY_CHUNK_SIZE)
            ),
            overlapSize: parseInt(
              Asserts.assertValue(getEnv().SUMMARY_OVERLAP_SIZE)
            ),
          });
        } catch (e) {
          console.error("roomUpdateListener error", e);
        }
      },
    });
  };
