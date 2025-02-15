import type {
  ConversationMessageNode,
} from "@mjt-services/daimon-common-2025";
import type { ObjectStore } from "@mjt-services/data-common-2025";

export const CONVERSATION_MESSAGE_OBJECT_STORE: ObjectStore<ConversationMessageNode> =
  {
    namespace: "conversation",
    store: "message",
  };


