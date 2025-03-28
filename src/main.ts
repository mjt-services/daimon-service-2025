import { getConnection } from "./getConnection";
import { roomUpdateListener } from "./listener/roomUpdateListener";

// Main function to start the service
export const main = async () => {
  const con = await getConnection();
  roomUpdateListener(con)();
};
