import { search } from "@mjt-services/data-common-2025";
import { getConnection } from "./getConnection";
import { roomUpdateListener } from "./listener/roomUpdateListener";

// Main function to start the service
export const main = async () => {
  await getConnection();
  roomUpdateListener();
};

