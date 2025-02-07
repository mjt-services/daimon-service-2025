import type { ConnectionListener } from "@mjt-engine/message";
import type {
  DaimonConnectionMap,
  DiamonCharaCard
} from "@mjt-services/daimon-common-2025";
import { Datas } from "../data/Datas";
import { DAIMON_CHARA_CARD_DB_STORE } from "./DAIMON_CHARA_CARD_DB_STORE";

export const daimonGetListener: ConnectionListener<
  DaimonConnectionMap,
  "daimon.get"
> = async (props) => {
  const { id } = props.detail.body;
  return Datas.get<DiamonCharaCard>({
    dbStore: DAIMON_CHARA_CARD_DB_STORE,
    key: id,
  });
};
