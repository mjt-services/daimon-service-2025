import type { ConnectionListener } from "@mjt-engine/message";
import { isUndefined, isDefined } from "@mjt-engine/object";
import type { DaimonConnectionMap, DaimonCharaCard, Daimon } from "@mjt-services/daimon-common-2025";
import { Datas } from "../data/Datas";
import { DAIMON_CHARA_CARD_DB_STORE } from "./DAIMON_CHARA_CARD_DB_STORE";
import { undefined } from "./daimonGetListener";


export const daimonListListener: ConnectionListener<
  DaimonConnectionMap, "daimon.list"
> = async (props) => {
  //TODO respect daimon.list query
  const { query } = props.detail.body;
  const ids = await Datas.list({ dbStore: DAIMON_CHARA_CARD_DB_STORE });
  const daimons = (
    await Promise.all(
      ids.map(async (id) => {
        const chara = await Datas.get<DaimonCharaCard>({
          dbStore: DAIMON_CHARA_CARD_DB_STORE,
          key: id,
        });
        if (isUndefined(chara)) {
          return undefined;
        }
        return { id, chara } as Daimon;
      })
    )
  ).filter(isDefined);
  return daimons;
};
