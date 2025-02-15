import type { ConnectionListener } from "@mjt-engine/message";
import { isUndefined, isDefined } from "@mjt-engine/object";
import type {
  DaimonConnectionMap,
  DaimonCharaCard,
  Daimon,
} from "@mjt-services/daimon-common-2025";
import { Datas } from "../data/Datas";
import { DAIMON_OBJECT_STORE } from "../data/DAIMON_CHARA_CARD_OBJECT_STORE";

export const daimonListListener: ConnectionListener<
  DaimonConnectionMap,
  "daimon.list"
> = async (props) => {
  const { query } = props.detail.body;
  const ids = (await Datas.search({
    from: DAIMON_OBJECT_STORE,
    query,
  })) as string[];
  const daimons = (
    await Promise.all(
      ids.map(async (id) => {
        const daimon = await Datas.get<Daimon>({
          objectStore: DAIMON_OBJECT_STORE,
          key: id,
        });
        if (isUndefined(daimon)) {
          return undefined;
        }
        return daimon;
      })
    )
  ).filter(isDefined);
  return daimons;
};
