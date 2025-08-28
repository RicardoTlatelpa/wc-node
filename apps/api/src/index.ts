import Fastify from "fastify";
import { z } from "zod";
import { crawlQueue, defaultJobOpts } from "@crawler/queue";
import { logger } from "@crawler/shared/logger";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = Fastify({ logger });

const startSchema = z.object({
  seedUrl: z.string().url(),
  maxPages: z.number().int().min(1).max(100000).default(10000),
  scope: z.enum(["DOMAIN", "SUBTREE", "GLOBAL"]).default("DOMAIN"),
});

app.post("/crawl/start", async (req, reply) => {
  const body = startSchema.parse(req.body);
  const crawl = await prisma.crawl.create({
    data: {
      seedUrl: body.seedUrl,
      maxPages: body.maxPages,
      scope: body.scope as any,
      status: "RUNNING",
      robotsRespect: true,
    },
  });
  await crawlQueue.add(
    "seed",
    { crawlId: crawl.id, url: body.seedUrl, depth: 0 },
    defaultJobOpts
  );
  return { crawlId: crawl.id };
});

app.get("/crawl/:id/status", async (req) => {
  const id = (req.params as any).id as string;
  const crawl = await prisma.crawl.findUnique({
    where: { id },
    include: { events: { orderBy: { at: "desc" }, take: 50 } },
  });
  return crawl ?? { id, events: [] };
});

app.listen({ port: Number(process.env.PORT) || 3000, host: "0.0.0.0" });
