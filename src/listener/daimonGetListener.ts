import type { ConnectionListener } from "@mjt-engine/message";
import type {
  Daimon,
  DaimonCharaCard,
  DaimonConnectionMap,
} from "@mjt-services/daimon-common-2025";
import { Datas } from "../data/Datas";
import { DAIMON_OBJECT_STORE } from "../data/DAIMON_CHARA_CARD_OBJECT_STORE";
import { isUndefined } from "@mjt-engine/object";

export const daimonGetListener: ConnectionListener<
  DaimonConnectionMap,
  "daimon.get"
> = async (props) => {
  const { id } = props.detail.body;
  const daimon = await Datas.get<Daimon>({
    objectStore: DAIMON_OBJECT_STORE,
    key: id,
  });
  if (isUndefined(daimon)) {
    return undefined;
  }
  return daimon;
};
