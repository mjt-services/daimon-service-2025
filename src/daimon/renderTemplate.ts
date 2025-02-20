import { isUndefined } from "@mjt-engine/object";

export const renderTemplate = (
  template?: string,
  vars: Record<string, string> = {}
) => {
  if (isUndefined(template)) {
    return undefined;
  }

  return template.replace(/{{\s*(\w+)\s*}}|{\s*(\w+)\s*}/g, (_, g1, g2) => {
    const key = g1 || g2;
    return vars[key] !== undefined ? vars[key] : "";
  });
};