import type { ConnectionListener } from "@mjt-engine/message";
import type {
  ConversationConnectionMap,
  ConversationMessageNode,
} from "@mjt-services/daimon-common-2025";
import { Ids } from "@mjt-services/data-common-2025";
import { CONVERSATION_MESSAGE_OBJECT_STORE } from "../data/CONVERSATION_MESSAGE_OBJECT_STORE";
import { Datas } from "../data/Datas";
import { LINK_DAIMON_TO_CONVERSATION_POINT_OBJECT_STORE } from "../data/LINK_DAIMON_TO_CONVERSATION_POINT_OBJECT_STORE";
import type { ConversationPointDaimonLink } from "../daimon/ConversationPointDaimonLink";

export const conversationAddListener: ConnectionListener<
  ConversationConnectionMap,
  "conversation.add"
> = async (props) => {
  const id = Ids.from("conv-msg");

  const node: ConversationMessageNode = {
    id,
    createdAt: Date.now(),
    ...props.detail.body,
  };

  const resp = await Datas.put({
    objectStore: CONVERSATION_MESSAGE_OBJECT_STORE,
    key: id,
    value: node,
  });

  return { success: true };
};

export const conversationLinkListener: ConnectionListener<
  ConversationConnectionMap,
  "conversation.link"
> = async (props) => {
  const id = Ids.fromObjectStore(
    LINK_DAIMON_TO_CONVERSATION_POINT_OBJECT_STORE
  );

  const { daimonId, point } = props.detail.body;

  const value: ConversationPointDaimonLink = {
    id,
    daimonId,
    ...point,
  };

  const resp = await Datas.put({
    objectStore: LINK_DAIMON_TO_CONVERSATION_POINT_OBJECT_STORE,
    key: id,
    value,
  });

  return { success: true };
};
