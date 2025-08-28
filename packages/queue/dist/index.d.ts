import { Queue, JobsOptions } from "bullmq";
import IORedis from "ioredis";
export declare const connection: IORedis;
export declare const CRAWL_QUEUE = "crawl";
export declare const crawlQueue: Queue<any, any, string, any, any, string>;
export declare const crawlScheduler: any;
export declare const defaultJobOpts: JobsOptions;
