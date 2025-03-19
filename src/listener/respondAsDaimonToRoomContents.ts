import { Messages } from "@mjt-engine/message";
import {
  type Daimon,
  type DaimonEventMap,
} from "@mjt-services/daimon-common-2025";
import { addContent } from "../common/addContent";
import { addRoom } from "../common/addRoom";
import { getConnection } from "../getConnection";
import { askDaimon } from "./askDaimon";

export const respondAsDaimonToRoomContents = async ({
  roomId,
  daimon,
  userDaimon,
}: {
  roomId: string;
  daimon: Daimon;
  userDaimon?: Daimon;
}) => {
  // TODO fix typing on the connectEventListenerToSubjectRoot function
  const foo: DaimonEventMap = {
    stop: "",
  };
  const assistantName = daimon.chara.data.name ?? "assistant";
  const { contentId, createdAt } = await addContent({
    creatorId: daimon.id,
    value: "",
  });
  await addRoom({
    contentId,
    parentId: roomId,
  });
  const con = await getConnection();
  const stopGenerationAbortController = new AbortController();
  const stopEventListenerAbortController = new AbortController();
  try {
    Messages.connectEventListenerToSubjectRoot<"stop", typeof foo>({
      connection: con.connection,
      subjectRoot: "stop",
      signal: stopEventListenerAbortController.signal,
      listener: async (message) => {
        stopGenerationAbortController.abort();
      },
    });
    return askDaimon({
      signal: stopGenerationAbortController.signal,
      assistantId: daimon.id,
      userId: userDaimon?.id,
      roomId,
      responseTextMapper: (text) => {
        return text.replace(new RegExp(`^ *${assistantName}: *`), "");
      },
      onUpdate: async (content) => {
        await addContent({
          ...content,
          contentId,
          createdAt,
        });
      },
      query: `Give ${assistantName}'s next response. Begin with '${assistantName}:'`,
    });
  } finally {
    stopEventListenerAbortController.abort();
  }
};
