import type { ConnectionListener } from "@mjt-engine/message";
import { isUndefined } from "@mjt-engine/object";
import {
  DAIMON_OBJECT_STORE,
  type Daimon,
  type DaimonConnectionMap,
} from "@mjt-services/daimon-common-2025";
import { Datas } from "../data/Datas";

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
