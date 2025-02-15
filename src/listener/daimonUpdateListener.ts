import type { ConnectionListener } from "@mjt-engine/message";
import type { DaimonConnectionMap } from "@mjt-services/daimon-common-2025";
import { Datas } from "../data/Datas";
import { DAIMON_OBJECT_STORE } from "../data/DAIMON_CHARA_CARD_OBJECT_STORE";

export const daimonUpdateListener: ConnectionListener<
  DaimonConnectionMap,
  "daimon.update"
> = async (props) => {
  await Datas.put({
    value: props.detail.body,
  });
  return { success: true };
};
