import { Asserts } from "@mjt-engine/assert";
import type { ConnectionListener } from "@mjt-engine/message";
import type {
  Daimon,
  DaimonConnectionMap,
} from "@mjt-services/daimon-common-2025";
import { Ids } from "@mjt-services/data-common-2025";
import { Datas } from "../data/Datas";
import { DAIMON_OBJECT_STORE } from "../data/DAIMON_CHARA_CARD_OBJECT_STORE";

export const daimonCreateListener: ConnectionListener<
  DaimonConnectionMap,
  "daimon.create"
> = async (props) => {
  const chara = props.detail.body;
  console.log("daimon.create", chara);
  const id = Ids.fromObjectStore(DAIMON_OBJECT_STORE);
  console.log("id", id);
  const daimon: Daimon = { id, chara };
  const resp = await Datas.put({
    value: daimon,
  });
  Asserts.assertEqual(resp, id);
  return { id };
};
