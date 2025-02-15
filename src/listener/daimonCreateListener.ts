import { Asserts } from "@mjt-engine/assert";
import type { ConnectionListener } from "@mjt-engine/message";
import type { DaimonConnectionMap } from "@mjt-services/daimon-common-2025";
import { Ids } from "@mjt-services/data-common-2025";
import { Datas } from "../data/Datas";
import { DAIMON_CHARA_CARD_OBJECT_STORE } from "../data/DAIMON_CHARA_CARD_OBJECT_STORE";

export const daimonCreateListener: ConnectionListener<
  DaimonConnectionMap,
  "daimon.create"
> = async (props) => {
  const charaCard = props.detail.body;
  console.log("daimon.create", charaCard);
  const id = Ids.from("chara-card");
  console.log("id", id);
  const resp = await Datas.put({
    objectStore: DAIMON_CHARA_CARD_OBJECT_STORE,
    key: id,
    value: charaCard,
  });
  Asserts.assertEqual(resp, id);
  return { id };
};
