import type { ConnectionListener } from "@mjt-engine/message";
import {
  Daimons,
  type DaimonConnectionMap,
} from "@mjt-services/daimon-common-2025";
import { getConnection } from "../getConnection";

export const daimonAskListener: ConnectionListener<
  DaimonConnectionMap,
  "daimon.ask"
> = async (props) => {
  const { send, detail, signal } = props;
  console.log("daimon.ask", detail.body);
  const con = await getConnection();
  await Daimons.askDaimon(con)({
    ...detail.body,
    signal,
    onUpdate: (content) => {
      send(content);
    },
  });
};
