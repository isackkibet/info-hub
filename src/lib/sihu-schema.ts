import { z } from "zod";

export const sihuSubmissionSchema = z
  .object({
    reporterName: z.string().trim().min(2, "Enter your name"),
    title: z.string().trim().min(5, "Title must be at least 5 characters"),
    category: z.enum([
      "WATER_HYACINTH_TRACKING",
      "LAKE_CLEANUP",
      "BLUE_ECONOMY_NEWS",
      "HUMAN_RIGHTS_REPORT",
      "POLLUTION_ALERT",
      "COMMUNITY_DEVELOPMENT_NEWS",
    ]),
    contentType: z.enum(["ARTICLE", "PICTURE", "VIDEO", "PODCAST"]),
    topic: z.string().trim().optional(),
    quantity: z
      .string()
      .trim()
      .refine(
        (v) => Number.isInteger(Number(v)) && Number(v) >= 1,
        "Quantity must be a whole number of at least 1",
      ),
    locationName: z.string().trim().min(2, "Location is required"),
    latitude: z
      .string()
      .trim()
      .optional()
      .refine(
        (v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= -90 && Number(v) <= 90),
        "Latitude must be a number between -90 and 90",
      ),
    longitude: z
      .string()
      .trim()
      .optional()
      .refine(
        (v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= -180 && Number(v) <= 180),
        "Longitude must be a number between -180 and 180",
      ),
    publicMediaUrl: z
      .string()
      .trim()
      .optional()
      .refine(
        (v) => !v || z.string().url().safeParse(v).success,
        "Enter a valid public link, such as an Instagram or X link",
      ),
    body: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.contentType === "ARTICLE") {
        return Boolean(data.publicMediaUrl) || Boolean(data.body);
      }
      return Boolean(data.publicMediaUrl);
    },
    {
      message:
        "Add a public link (or write the article below for an article submission)",
      path: ["publicMediaUrl"],
    },
  );

export type SihuSubmissionInput = z.infer<typeof sihuSubmissionSchema>;
