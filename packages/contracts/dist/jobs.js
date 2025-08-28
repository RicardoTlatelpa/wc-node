"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrawlJobSchema = void 0;
const zod_1 = require("zod");
exports.CrawlJobSchema = zod_1.z.object({
    crawlId: zod_1.z.string(),
    url: zod_1.z.string().url(),
    depth: zod_1.z.number().int().nonnegative(),
    parent: zod_1.z.string().url().optional(),
});
