import { z } from "zod";
import { localizedTextSchema } from "./provider";

export const adminProviderStatusSchema = z.object({
  status: z.enum(["draft", "pending_verification", "active", "suspended"]),
  verified: z.boolean(),
});

export const adminCategorySchema = z.object({
  slug: z
    .string()
    .min(2, "Key is required.")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and dashes only."),
  label: localizedTextSchema.superRefine((value, context) => {
    if (!value.sl.trim()) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Slovenian category name is required." });
    }
  }),
  icon: z.string().min(1, "Icon key is required."),
  isActive: z.boolean(),
});
