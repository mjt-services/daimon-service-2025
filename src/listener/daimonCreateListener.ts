import { Asserts } from "@mjt-engine/assert";
import type { ConnectionListener } from "@mjt-engine/message";
import {
  DAIMON_OBJECT_STORE,
  type Daimon,
  type DaimonConnectionMap,
} from "@mjt-services/daimon-common-2025";
import { Ids } from "@mjt-services/data-common-2025";
import { Datas } from "../data/Datas";

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
  console.log("daimon.create: resp", resp);
  Asserts.assertEqual(resp, id);
  return { id };
};
