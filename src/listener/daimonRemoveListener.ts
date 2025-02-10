import type { ConnectionListener } from "@mjt-engine/message";
import { isUndefined } from "@mjt-engine/object";
import type { DaimonConnectionMap } from "@mjt-services/daimon-common-2025";
import { Datas } from "../data/Datas";
import { DAIMON_CHARA_CARD_DB_STORE } from "./DAIMON_CHARA_CARD_DB_STORE";

export const daimonRemoveListener: ConnectionListener<
  DaimonConnectionMap,
  "daimon.remove"
> = async (props) => {
  const { id } = props.detail.body;
  const chara = await Datas.remove({
    dbStore: DAIMON_CHARA_CARD_DB_STORE,
    query: id,
  });
  if (isUndefined(chara)) {
    return undefined;
  }
  return { success: true };
};
