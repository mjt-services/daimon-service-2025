import { Messages } from "@mjt-engine/message";
import type { Env } from "./Env";

import { assertValue } from "@mjt-engine/assert";
import type { DaimonConnectionMap } from "@mjt-services/daimon-common-2025";
import type { DataConnectionMap } from "@mjt-services/data-common-2025";
import type { TextgenConnectionMap } from "@mjt-services/textgen-common-2025";
import { getEnv } from "./getEnv";
import { daimonAskListener } from "./listener/daimonAskListener";

export const initConnection = async () => {
  const env = getEnv();
  const url = assertValue(env.NATS_URL);
  console.log("NATS_URL", url);

  const con = await Messages.createConnection<
    DaimonConnectionMap & DataConnectionMap & TextgenConnectionMap,
    Env
  >({
    subscribers: {
      "daimon.ask": daimonAskListener,
    },
    options: { log: console.log },
    server: [url],
    token: env.NATS_AUTH_TOKEN,
    env,
  });
  console.log("initConnection: init complete");
  return con;
};
