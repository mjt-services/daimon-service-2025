import {
  CONTENT_OBJECT_STORE,
  type Content,
} from "@mjt-services/daimon-common-2025";
import { Ids, Datas } from "@mjt-services/data-common-2025";
import { getConnection } from "../getConnection";

export const addTextContent = async ({
  text,
  creatorId,
  contentId = Ids.fromObjectStore(CONTENT_OBJECT_STORE),
  finalized = false,
  createdAt = Date.now(),
}: {
  contentId?: string;
  text: string;
  creatorId: string;
  finalized?: boolean;
  createdAt?: number;
}) => {
  const content: Content = {
    id: contentId,
    contentType: "plain/text",
    value: text,
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
