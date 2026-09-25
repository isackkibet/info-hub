import { z } from "zod";

export const cfaActivitySchema = z.object({
  recordedBy: z.string().trim().min(2, "Enter your name"),
  activityType: z.enum([
    "PROPAGATION",
    "SOWING",
    "WATERING",
    "PEST_MANAGEMENT",
    "SALE",
    "DONATION",
    "TRANSFER",
    "PLANTING",
    "MORTALITY",
    "OTHER",
  ]),
  siteName: z.string().trim().min(1, "Select a site or nursery"),
  speciesName: z.string().trim().optional(),
  quantity: z
    .string()
    .trim()
    .refine(
      (v) => Number.isInteger(Number(v)) && Number(v) >= 1,
      "Quantity must be a whole number of at least 1",
    ),
  notes: z.string().trim().optional(),
});

export type CfaActivityInput = z.infer<typeof cfaActivitySchema>;
