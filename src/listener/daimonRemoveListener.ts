import type { ConnectionListener } from "@mjt-engine/message";
import { isUndefined } from "@mjt-engine/object";
import type { DaimonConnectionMap } from "@mjt-services/daimon-common-2025";
import { Datas } from "../data/Datas";
import { DAIMON_OBJECT_STORE } from "../data/DAIMON_CHARA_CARD_OBJECT_STORE";

export const daimonRemoveListener: ConnectionListener<
  DaimonConnectionMap,
  "daimon.remove"
> = async (props) => {
  const { id } = props.detail.body;
  const chara = await Datas.remove({
    objectStore: DAIMON_OBJECT_STORE,
    query: id,
  });
  if (isUndefined(chara)) {
    return undefined;
  }
  return { success: true };
};
