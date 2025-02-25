import { daimonToSystemPrompt } from "./daimonToSystemPrompt";
import { idToDaimon } from "./idToDaimon";

// export const notifyDaimon = (msgNode: ConversationMessageNode) => {
//   const vars: CharaCardVars = {
//     char: "assistant",
//     user: "user",
//   };
//   const { speakerId, groupId, channelId, } = msgNode;

//   // const daimonSystemPrompt = daimonToSystemPrompt(, vars);
//   // get system prompt(s)
//   // get conv history
//   // add msgNode to history
//   // generate stream-response from LLM
//   // capture stream-response as it comes in
//   // finalize stream-response after it ends
// };

export const Daimons = { idToDaimon, daimonToSystemPrompt };
