import type { ConnectionListener } from "@mjt-engine/message";
import { type DaimonConnectionMap } from "@mjt-services/daimon-common-2025";
import { askDaimon } from "./askDaimon";

export const daimonAskListener: ConnectionListener<
  DaimonConnectionMap,
  "daimon.ask"
> = async (props) => {
  const { send, detail, signal } = props;
  console.log("daimon.ask", detail.body);
  await askDaimon({
    ...detail.body,
    signal,
    onUpdate: (content) => {
      send(content);
    },
  });
};
