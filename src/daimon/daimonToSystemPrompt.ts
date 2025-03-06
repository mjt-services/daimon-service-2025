import { iff, isDefined } from "@mjt-engine/object";
import type { Daimon } from "@mjt-services/daimon-common-2025";
import { renderTemplate } from "./renderTemplate";

export const daimonToSystemPrompt = (
  daimon: Daimon,
  vars: Record<string, string> = {}
) => {
  const { chara } = daimon;
  const { data } = chara;
  const {
    description,
    personality,
    name,
    system_prompt,
    extensions = {},
  } = data;

  return [
    iff(name, (x) => "The assistant's name is " + x),
    iff(extensions.depth_prompt, (dp) => dp.prompt),
    renderTemplate(description, vars),
    renderTemplate(personality, vars),
    renderTemplate(system_prompt, vars),
  ]
    .filter(isDefined)
    .join("\n");
};
