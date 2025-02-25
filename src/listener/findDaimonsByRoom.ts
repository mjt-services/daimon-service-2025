import { Datas, LINK_OBJECT_STORE } from "@mjt-services/data-common-2025";
import { getConnection } from "../getConnection";


export const findDaimonsByRoom = async (roomId: string): Promise<string[]> => {
  return Datas.search(await getConnection())({
    from: LINK_OBJECT_STORE,
    query: `values(@)[?roomId == '${roomId}'].daimonId | []`,
  }) as Promise<string[]>;
};
