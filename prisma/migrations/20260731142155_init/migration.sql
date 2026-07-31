-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'DRAFT_READY', 'REPLIED', 'IGNORED', 'CONVERTED');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "subreddit" TEXT,
    "url" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "title" TEXT,
    "snippet" TEXT NOT NULL,
    "fullText" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3) NOT NULL,
    "foundAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchedPhrase" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "confidenceLabel" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "contactInfo" JSONB,
    "needSummary" TEXT,
    "nicheTag" TEXT,
    "draftReply" TEXT,
    "draftGeneratedAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubredditConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "pollPosts" BOOLEAN NOT NULL DEFAULT true,
    "pollComments" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenPostId" TEXT,
    "lastSeenCommentId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubredditConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntentPhrase" (
    "id" TEXT NOT NULL,
    "phrase" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INCLUDE',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntentPhrase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "triggeredBy" TEXT,
    "subredditsPolled" INTEGER NOT NULL DEFAULT 0,
    "postsFetched" INTEGER NOT NULL DEFAULT 0,
    "commentsFetched" INTEGER NOT NULL DEFAULT 0,
    "candidatesAfterKeywordFilter" INTEGER NOT NULL DEFAULT 0,
    "leadsCreated" INTEGER NOT NULL DEFAULT 0,
    "geminiCallsMade" INTEGER NOT NULL DEFAULT 0,
    "errorsJson" JSONB,

    CONSTRAINT "PollRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_platform_subreddit_idx" ON "Lead"("platform", "subreddit");

-- CreateIndex
CREATE INDEX "Lead_postedAt_idx" ON "Lead"("postedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_platform_externalId_key" ON "Lead"("platform", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "SubredditConfig_name_key" ON "SubredditConfig"("name");

-- CreateIndex
CREATE UNIQUE INDEX "IntentPhrase_phrase_key" ON "IntentPhrase"("phrase");
