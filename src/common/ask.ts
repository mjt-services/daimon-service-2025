import { iff, isDefined } from "@mjt-engine/object";
import { getConnection } from "../getConnection";
import { getEnv } from "../getEnv";

export const ask = async ({
  userMessage,
  systemMessage,
  timeoutMs = 60 * 1000,
  model = getEnv().DEFAULT_LLM,
}: {
  systemMessage?: string;
  userMessage: string;
  timeoutMs?: number;
  model?: string;
}): Promise<string | undefined> => {
  const con = await getConnection();
  return new Promise(async (resolve, reject) => {
    await con.requestMany({
      options: {
        timeoutMs,
      },

      subject: "textgen.generate",
      onResponse: async (response) => {
        if (response.done) {
          resolve(response.text);
          return;
        }
      },
      request: {
        body: {
          model,
          stream: true,
          messages: [
            iff(
              systemMessage,
              (content) =>
                ({
                  role: "system",
                  content,
                } as const)
            ),
            {
              role: "user",
              content: userMessage,
            } as const,
          ].filter(isDefined),
        },
      },
    });
  });
};
