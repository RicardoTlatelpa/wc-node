-- CreateEnum
CREATE TYPE "CrawlStatus" AS ENUM ('RUNNING', 'PAUSED', 'FINISHED', 'FAILED');

-- CreateEnum
CREATE TYPE "Scope" AS ENUM ('DOMAIN', 'SUBTREE', 'GLOBAL');

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "statusCode" INTEGER,
    "contentType" TEXT,
    "fetchedAt" TIMESTAMP(3),
    "hash" TEXT,
    "storageKey" TEXT,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toUrl" TEXT NOT NULL,
    "rel" TEXT,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crawl" (
    "id" TEXT NOT NULL,
    "seedUrl" TEXT NOT NULL,
    "status" "CrawlStatus" NOT NULL DEFAULT 'RUNNING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "maxPages" INTEGER NOT NULL DEFAULT 10000,
    "scope" "Scope" NOT NULL DEFAULT 'DOMAIN',
    "robotsRespect" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Crawl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawlEvent" (
    "id" TEXT NOT NULL,
    "crawlId" TEXT NOT NULL,
    "pageId" TEXT,
    "type" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT,

    CONSTRAINT "CrawlEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dedupe" (
    "urlHash" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dedupe_pkey" PRIMARY KEY ("urlHash")
);

-- CreateIndex
CREATE UNIQUE INDEX "Page_url_key" ON "Page"("url");

-- CreateIndex
CREATE INDEX "Page_domain_idx" ON "Page"("domain");

-- CreateIndex
CREATE INDEX "Page_hash_idx" ON "Page"("hash");

-- CreateIndex
CREATE INDEX "Link_toUrl_idx" ON "Link"("toUrl");

-- CreateIndex
CREATE INDEX "Link_fromId_idx" ON "Link"("fromId");

-- CreateIndex
CREATE INDEX "CrawlEvent_crawlId_at_idx" ON "CrawlEvent"("crawlId", "at");

-- CreateIndex
CREATE INDEX "CrawlEvent_pageId_idx" ON "CrawlEvent"("pageId");

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawlEvent" ADD CONSTRAINT "CrawlEvent_crawlId_fkey" FOREIGN KEY ("crawlId") REFERENCES "Crawl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawlEvent" ADD CONSTRAINT "CrawlEvent_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;
