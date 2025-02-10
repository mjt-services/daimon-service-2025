import type { ConnectionListener } from "@mjt-engine/message";
import type { DaimonConnectionMap } from "@mjt-services/daimon-common-2025";
import { Datas } from "../data/Datas";
import { DAIMON_CHARA_CARD_DB_STORE } from "./DAIMON_CHARA_CARD_DB_STORE";


export const daimonUpdateListener: ConnectionListener<
  DaimonConnectionMap, "daimon.update"
> = async (props) => {
  const { id, chara } = props.detail.body;
  await Datas.put({
    dbStore: DAIMON_CHARA_CARD_DB_STORE,
    key: id,
    value: chara,
  });
  return { success: true };
};
