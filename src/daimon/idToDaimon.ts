import { type Daimon, DAIMON_OBJECT_STORE } from "@mjt-services/daimon-common-2025";
import { Datas } from "@mjt-services/data-common-2025";
import { getConnection } from "../getConnection";


export const idToDaimon = async (id: string): Promise<Daimon | undefined> => {
  return Datas.get(await getConnection())<Daimon>({
    objectStore: DAIMON_OBJECT_STORE,
    key: id,
  });
};
