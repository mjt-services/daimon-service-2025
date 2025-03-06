export type Env = Partial<{
  NATS_URL: string;
  NATS_AUTH_TOKEN: string;
  DEFAULT_LLM: string;
  SUMMARY_LLM: string;
  SUMMARY_CHUNK_SIZE: string;
  SUMMARY_OVERLAP_SIZE: string;
}>;
