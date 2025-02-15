import type { ObjectStore } from "@mjt-services/data-common-2025";
import type { DaimonToConversationPoint } from "./DaimonToConversationPoint";

export const LINK_DAIMON_TO_CONVERSATION_POINT_OBJECT_STORE: ObjectStore<DaimonToConversationPoint> =
  {
    namespace: "link",
    store: "daimon-to-conversation-point",
  };
