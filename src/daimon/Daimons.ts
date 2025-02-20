import { iff, isDefined } from "@mjt-engine/object";
import {
  DAIMON_OBJECT_STORE,
  type Daimon,
  type DaimonCharaCard,
} from "@mjt-services/daimon-common-2025";
import { renderTemplate } from "./renderTemplate";
import { Datas } from "../data/Datas";

export type CharaCardVars = Partial<{
  char: string;
  user: string;
}>;

export const daimonToSystemPrompt = (
  daimon: Daimon,
  vars: Record<string, string> = {}
) => {
  const { chara } = daimon;
  const { data } = chara;
  const { description, personality, name, system_prompt } = data;

  return [
    iff(name, (x) => "The assistant's name is " + x),
    renderTemplate(description, vars),
    renderTemplate(personality, vars),
    renderTemplate(system_prompt, vars),
  ]
    .filter(isDefined)
    .join("\n");
};

export const DEFAULT_CHARA_CARD: DaimonCharaCard = {
  data: {
    name: "assistant",
  },
  spec: "chara_card_v2",
  spec_version: "2",
};

export const idToDaimon = async (id: string): Promise<Daimon> => {
  const daimon = await Datas.get<Daimon>({
    objectStore: DAIMON_OBJECT_STORE,
    key: id,
  });

  const chara = isDefined(daimon) ? daimon.chara : DEFAULT_CHARA_CARD;

  return {
    id,
    chara: chara,
  };
};


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

export const Daimons = {};