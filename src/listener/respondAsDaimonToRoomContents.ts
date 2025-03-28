import { Messages } from "@mjt-engine/message";
import {
  CONTENT_OBJECT_STORE,
  Daimons,
  ROOM_OBJECT_STORE,
  type Daimon,
  type DaimonEventMap,
} from "@mjt-services/daimon-common-2025";
import { Datas } from "@mjt-services/data-common-2025";
import { getConnection } from "../getConnection";

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
  const con = await getConnection();
  const createdAt = Date.now();
  const contentId = await Datas.putEntity(con)(CONTENT_OBJECT_STORE)({
    creatorId: daimon.id,
    value: "",
    createdAt,
  });

  await Datas.putEntity(con)(ROOM_OBJECT_STORE)({
    contentId,
    parentId: roomId,
  });

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
    return Daimons.askDaimon(con)({
      signal: stopGenerationAbortController.signal,
      assistantId: daimon.id,
      userId: userDaimon?.id,
      roomId,
      responseTextMapper: (text) => {
        return text.replace(new RegExp(`^ *${assistantName}: *`), "");
      },
      onUpdate: async (content) => {
        await Datas.putEntity(con)(CONTENT_OBJECT_STORE)({
          ...content,
          id: contentId,
        });
      },
      query: `Give ${assistantName}'s next response. Begin with '${assistantName}:'`,
    });
  } finally {
    stopEventListenerAbortController.abort();
  }
};
