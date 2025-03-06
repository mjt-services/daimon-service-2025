import { Datas, LINK_OBJECT_STORE } from "@mjt-services/data-common-2025";
import { getConnection } from "../getConnection";
import {
  DAIMON_OBJECT_STORE,
  type Daimon,
} from "@mjt-services/daimon-common-2025";

export const findDaimonsByRoom = async (roomId: string): Promise<Daimon[]> => {
  const ids = (await Datas.search(await getConnection())({
    from: LINK_OBJECT_STORE,
    query: `values(@)[?roomId == '${roomId}'].daimonId | []`,
  })) as string[];

  const query = `values(@)[?contains(['${ids.join("','")}'], id)]`;

  const daimons = (await Datas.search(await getConnection())({
    from: DAIMON_OBJECT_STORE,
    query,
  })) as Daimon[];
  return daimons;
};
