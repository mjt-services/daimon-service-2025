import type { ConnectionListener } from "@mjt-engine/message";
import type {
  DaimonCharaCard,
  DaimonConnectionMap,
} from "@mjt-services/daimon-common-2025";
import { Datas } from "../data/Datas";
import { DAIMON_CHARA_CARD_OBJECT_STORE } from "../data/DAIMON_CHARA_CARD_OBJECT_STORE";
import { isUndefined } from "@mjt-engine/object";

export const daimonGetListener: ConnectionListener<
  DaimonConnectionMap,
  "daimon.get"
> = async (props) => {
  const { id } = props.detail.body;
  const chara = await Datas.get<DaimonCharaCard>({
    objectStore: DAIMON_CHARA_CARD_OBJECT_STORE,
    key: id,
  });
  if (isUndefined(chara)) {
    return undefined;
  }
  return {
    id,
    chara,
  };
};
