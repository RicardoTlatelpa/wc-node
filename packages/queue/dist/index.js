"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultJobOpts = exports.crawlQueue = exports.CRAWL_QUEUE = exports.connection = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
exports.connection = new ioredis_1.default(REDIS_URL);
exports.CRAWL_QUEUE = "crawl";
exports.crawlQueue = new bullmq_1.Queue(exports.CRAWL_QUEUE, { connection: exports.connection });
exports.defaultJobOpts = {
    removeOnComplete: 1000,
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
    // no 'timeout' here — not part of JobsOptions
};
