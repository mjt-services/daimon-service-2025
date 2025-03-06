import {
  CONTENT_OBJECT_STORE,
  type Content,
} from "@mjt-services/daimon-common-2025";
import { Ids, Datas } from "@mjt-services/data-common-2025";
import { getConnection } from "../getConnection";
import { MESSAGE_CONTENT_TYPE } from "./MESSAGE_CONTENT_TYPE";

export const addContent = async ({
  value,
  creatorId,
  contentId = Ids.fromObjectStore(CONTENT_OBJECT_STORE),
  finalized = false,
  createdAt = Date.now(),
  contentType = MESSAGE_CONTENT_TYPE,
}: {
  contentType?: string;
  contentId?: string;
  value: unknown;
  creatorId?: string;
  finalized?: boolean;
  createdAt?: number;
}) => {
  const content: Content = {
    id: contentId,
    contentType,
    value,
    creatorId,
    createdAt,
    finalized,
    updatedAt: Date.now(),
  };
  await Datas.put(await getConnection())({
    value: content,
  });
  return { contentId, createdAt };
};
