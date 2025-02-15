import type { ConnectionListener } from "@mjt-engine/message";
import type { DaimonConnectionMap } from "@mjt-services/daimon-common-2025";
import { Datas } from "../data/Datas";
import { DAIMON_CHARA_CARD_OBJECT_STORE } from "../data/DAIMON_CHARA_CARD_OBJECT_STORE";

export const daimonUpdateListener: ConnectionListener<
  DaimonConnectionMap,
  "daimon.update"
> = async (props) => {
  const { id, chara } = props.detail.body;
  await Datas.put({
    objectStore: DAIMON_CHARA_CARD_OBJECT_STORE,
    key: id,
    value: chara,
  });
  return { success: true };
};
