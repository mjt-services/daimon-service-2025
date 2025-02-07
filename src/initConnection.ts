import { Messages } from "@mjt-engine/message";
import type { Env } from "./Env";

import { assertValue } from "@mjt-engine/assert";
import type { DaimonConnectionMap } from "@mjt-services/daimon-common-2025";
import { getEnv } from "./getEnv";
import { daimonCreateListener } from "./listener/daimonCreateListener";
import type { DataConnectionMap } from "@mjt-services/data-common-2025";
import { daimonGetListener } from "./listener/daimonGetListener";

export const initConnection = async () => {
  const env = getEnv();
  const url = assertValue(env.NATS_URL);
  console.log("NATS_URL", url);

  const con = await Messages.createConnection<
    DaimonConnectionMap & DataConnectionMap,
    Env
  >({
    subscribers: {
      "daimon.create": daimonCreateListener,
      "daimon.get": daimonGetListener,
    },
    options: { log: console.log },
    server: [url],
    token: env.NATS_AUTH_TOKEN,
    env,
  });
  console.log("initConnection: init complete");
  return con;
};
