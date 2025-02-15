import type { ConversationPoint } from "@mjt-services/daimon-common-2025";
import type { ObjectStore } from "@mjt-services/data-common-2025";

export type DaimonToConversationPoint = {
  daimonId: string;
  conversationPoint: ConversationPoint;
};

export const LINK_DAIMON_TO_CONVERSATION_POINT_OBJECT_STORE: ObjectStore<DaimonToConversationPoint> =
  {
    namespace: "",
    store: "DaimonToConversationPoint",
  };
