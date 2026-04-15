import { z } from "zod";

export const localizedTextSchema = z.object({
  sl: z.string(),
  en: z.string(),
  de: z.string(),
  it: z.string(),
});

export const providerProfileSchema = z.object({
  name: localizedTextSchema.superRefine((value, context) => {
    if (!Object.values(value).some((entry) => entry.trim().length > 0)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Add at least one provider name." });
    }
  }),
  shortDescription: localizedTextSchema,
  description: localizedTextSchema,
  address: localizedTextSchema.superRefine((value, context) => {
    if (!Object.values(value).some((entry) => entry.trim().length > 0)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Add at least one localized address." });
    }
  }),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Use a valid email.").optional().or(z.literal("")),
  website: z.string().url("Use a valid website URL.").optional().or(z.literal("")),
});

export const claimRequestSchema = z.object({
  providerId: z.string().uuid("Choose a provider to claim."),
  requesterName: z.string().min(2, "Add your full name."),
  requesterEmail: z.string().email("Use a valid email."),
  requesterPhone: z.string().min(6, "Add a reachable phone number.").optional().or(z.literal("")),
  message: z.string().min(10, "Add a short message so the admin can verify the request."),
});

export const openingHoursEntrySchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    opensAt: z.string().nullable(),
    closesAt: z.string().nullable(),
    isClosed: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.isClosed) return;
    if (!value.opensAt || !value.closesAt) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Add both opening and closing time." });
      return;
    }
    if (value.opensAt >= value.closesAt) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Closing time must be after opening time." });
    }
  });

export const openingHoursSchema = z.object({
  hours: z.array(openingHoursEntrySchema).length(7),
});

export const offerPostSchema = z
  .object({
    title: localizedTextSchema.superRefine((value, context) => {
      if (!Object.values(value).some((entry) => entry.trim().length > 0)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Add at least one offer title." });
      }
    }),
    body: localizedTextSchema,
    validFrom: z.string().min(1, "Choose a start date."),
    validTo: z.string().min(1, "Choose an end date."),
    isFreshToday: z.boolean(),
    isDiscount: z.boolean(),
    priceLabel: z.string().optional().or(z.literal("")),
    discountPercent: z.union([z.coerce.number().min(0).max(100), z.null()]),
    status: z.enum(["active", "archived"]),
  })
  .superRefine((value, context) => {
    if (new Date(value.validFrom).getTime() >= new Date(value.validTo).getTime()) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "End date must be after start date." });
    }
    if (value.isFreshToday && value.isDiscount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choose either Fresh Today or Discount for one post in this MVP.",
      });
    }
    if (
      value.isDiscount &&
      (value.discountPercent === null || Number.isNaN(value.discountPercent) || value.discountPercent <= 0)
    ) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Add a discount percent for discount posts." });
    }
  });
