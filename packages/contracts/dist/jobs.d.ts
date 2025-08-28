import { z } from "zod";
export declare const CrawlJobSchema: z.ZodObject<{
    crawlId: z.ZodString;
    url: z.ZodString;
    depth: z.ZodNumber;
    parent: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    crawlId: string;
    url: string;
    depth: number;
    parent?: string | undefined;
}, {
    crawlId: string;
    url: string;
    depth: number;
    parent?: string | undefined;
}>;
export type CrawlJob = z.infer<typeof CrawlJobSchema>;
