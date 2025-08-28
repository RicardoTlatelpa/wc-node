import { Worker } from "bullmq";
import IORedis from "ioredis";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import crypto from "crypto";

import { CRAWL_QUEUE, crawlQueue, defaultJobOpts } from "@crawler/queue";
import { CrawlJobSchema } from "@crawler/contracts/jobs";
import { logger } from "@crawler/shared/logger";
import { allowed } from "@crawler/shared/robots";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const connection = new IORedis(
  process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
  { maxRetriesPerRequest: null }
);

const RATE_GAP_MS = Number(process.env.HOST_GAP_MS ?? 1500);
const WORKER_CONCURRENCY = Number(process.env.WORKER_CONCURRENCY ?? 8);

const seenKey = (crawlId: string) => `crawl:${crawlId}:seen`;
const hostRateKey = (host: string) => `host:${host}:next`;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const canonicalize = (u: string) => {
  const x = new URL(u);
  x.hash = "";
  return x.toString();
};
const sha1 = (s: string) => crypto.createHash("sha1").update(s).digest("hex");

export const worker = new Worker(
  CRAWL_QUEUE,
  async (job) => {
    const input = CrawlJobSchema.parse(job.data);
    const url = canonicalize(input.url);
    const host = new URL(url).host;

    // per-host politeness
    const now = Date.now();
    const next = Number(await connection.get(hostRateKey(host))) || 0;
    if (next > now) await delay(next - now);
    await connection.set(hostRateKey(host), String(Date.now() + RATE_GAP_MS));

    // dedupe per crawl
    const h = sha1(url);
    const added = await connection.sadd(seenKey(input.crawlId), h);
    if (added === 0) return; // already seen

    // robots.txt
    if (!(await allowed(url))) return;

    // fetch
    const res = await fetch(url, { redirect: "follow" });
    const contentType = res.headers.get("content-type") || "";
    const isHtml = contentType.includes("text/html");
    const text = isHtml ? await res.text() : "";

    // upsert Page
    const page = await prisma.page.upsert({
      where: { url },
      update: { statusCode: res.status, contentType, fetchedAt: new Date() },
      create: {
        url,
        domain: host,
        statusCode: res.status,
        contentType,
        fetchedAt: new Date(),
      },
    });

    await prisma.crawlEvent.create({
      data: {
        crawlId: input.crawlId,
        pageId: page.id,
        type: "FETCH",
        message: String(res.status),
      },
    });

    if (!text) return;

    // parse links
    const $ = cheerio.load(text);
    const links: string[] = [];
    $("a[href]").each((_, a) => {
      const href = $(a).attr("href");
      if (!href) return;
      try {
        const abs = new URL(href, url).toString();
        links.push(abs);
      } catch {}
    });

    // same-host fan-out (scope=DOMAIN; crude limit)
    const sameHost = links.filter((l) => {
      try {
        return new URL(l).host === host;
      } catch {
        return false;
      }
    });
    const toStore = sameHost.slice(0, 200);

    // store edges (fire-and-forget)
    for (const l of toStore) {
      prisma.link
        .create({ data: { fromId: page.id, toUrl: l } })
        .catch(() => {});
    }

    // enqueue next depth
    const nextDepth = (input.depth ?? 0) + 1;
    for (const l of toStore) {
      await crawlQueue.add(
        "crawl",
        { crawlId: input.crawlId, url: l, depth: nextDepth },
        defaultJobOpts
      );
    }
  },
  { connection, concurrency: WORKER_CONCURRENCY }
);

worker.on("completed", (job) =>
  logger.debug({ jobId: job.id }, "worker: completed")
);
worker.on("failed", (job, err) =>
  logger.error({ jobId: job?.id, err }, "worker: failed")
);
