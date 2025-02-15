import type { DaimonCharaCard } from "@mjt-services/daimon-common-2025";
import type { ObjectStore } from "@mjt-services/data-common-2025";

export const DAIMON_CHARA_CARD_OBJECT_STORE: ObjectStore<DaimonCharaCard> = {
  namespace: "daimon",
  store: "chara-card",
};
