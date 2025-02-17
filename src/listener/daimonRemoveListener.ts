import type { ConnectionListener } from "@mjt-engine/message";
import { isUndefined } from "@mjt-engine/object";
import {
  DAIMON_OBJECT_STORE,
  type DaimonConnectionMap,
} from "@mjt-services/daimon-common-2025";
import { Datas } from "../data/Datas";

export const daimonRemoveListener: ConnectionListener<
  DaimonConnectionMap,
  "daimon.remove"
> = async (props) => {
  const { id } = props.detail.body;
  const chara = await Datas.remove({
    objectStore: DAIMON_OBJECT_STORE,
    query: id,
  });
  if (isUndefined(chara)) {
    return undefined;
  }
  return { success: true };
};
