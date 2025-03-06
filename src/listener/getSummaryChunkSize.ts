import { getEnv } from "../getEnv";


export const getSummaryChunkSize = () => {
  const { SUMMARY_CHUNK_SIZE = "7", SUMMARY_OVERLAP_SIZE = "2" } = getEnv();
  const chunkSize = parseInt(SUMMARY_CHUNK_SIZE, 10);
  const overlapSize = parseInt(SUMMARY_OVERLAP_SIZE, 10);
  return { chunkSize, overlapSize };
};
