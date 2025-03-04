import { DAIMON_OBJECT_STORE, type Daimon } from "@mjt-services/daimon-common-2025";
import { Datas } from "@mjt-services/data-common-2025";
import { getConnection } from "../getConnection";


export const getAllDaimons = async () => {
  return Datas.search(await getConnection())({
    from: DAIMON_OBJECT_STORE,
    query: "values(@)",
  }) as Promise<Daimon[]>;
};
