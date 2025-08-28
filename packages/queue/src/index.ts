import { Queue, JobsOptions } from "bullmq";
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
export const connection = new IORedis(REDIS_URL);

export const CRAWL_QUEUE = "crawl";
export const crawlQueue = new Queue(CRAWL_QUEUE, { connection });

export const defaultJobOpts: JobsOptions = {
  removeOnComplete: 1000,
  attempts: 5,
  backoff: { type: "exponential", delay: 2000 },
};
