import type { LocalizedText } from "@radar-domace/types";

export const pickLocalizedText = (value?: Partial<LocalizedText> | null) =>
  value?.sl?.trim() || value?.en?.trim() || value?.de?.trim() || value?.it?.trim() || "";
