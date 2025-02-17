import type { ConnectionListener } from "@mjt-engine/message";
import { isDefined } from "@mjt-engine/object";
import {
  DAIMON_OBJECT_STORE,
  type Daimon,
  type DaimonConnectionMap,
} from "@mjt-services/daimon-common-2025";
import { Datas } from "../data/Datas";

export const daimonListListener: ConnectionListener<
  DaimonConnectionMap,
  "daimon.list"
> = async (props) => {
  const { query } = props.detail.body;
  const daimons = (await Datas.search({
    from: DAIMON_OBJECT_STORE,
    query: "values(@)",
    next: isDefined(query)
      ? {
          query,
        }
      : undefined,
  })) as Daimon[];
  return daimons;
};
