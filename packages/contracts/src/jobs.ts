import { z } from "zod";

export const CrawlJobSchema = z.object({
  crawlId: z.string(),
  url: z.string().url(),
  depth: z.number().int().nonnegative(),
  parent: z.string().url().optional(),
});
export type CrawlJob = z.infer<typeof CrawlJobSchema>;
