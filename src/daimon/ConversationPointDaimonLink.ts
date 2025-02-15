import type { ConversationPoint } from "@mjt-services/daimon-common-2025";

export type ConversationPointDaimonLink = ConversationPoint & {
  id: string;
  daimonId: string;
};
