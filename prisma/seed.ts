import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SUBREDDITS = [
  "forhire",
  "freelance",
  "videoediting",
  "marketing",
  "Entrepreneur",
  "smallbusiness",
  "ecommerce",
  "shopify",
  "dropship",
  "EtsySellers",
];

const INCLUDE_PHRASES = [
  "looking for a ugc creator",
  "need a ugc creator",
  "need ugc content",
  "need ugc videos",
  "looking for ugc ads",
  "need ai ugc",
  "ai avatar ads",
  "ai avatar content",
  "need video ads for my store",
  "need video ads for my shopify",
  "looking for someone to make ugc",
  "hire a ugc creator",
];

const EXCLUDE_PHRASES = [
  "which software should i use",
  "tutorial",
  "check out my portfolio",
  "diy editing tips",
  "ugc creator available",
  "check out my ugc",
];

async function main() {
  for (const name of SUBREDDITS) {
    await prisma.subredditConfig.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const phrase of INCLUDE_PHRASES) {
    await prisma.intentPhrase.upsert({
      where: { phrase },
      update: {},
      create: { phrase, type: "INCLUDE" },
    });
  }

  for (const phrase of EXCLUDE_PHRASES) {
    await prisma.intentPhrase.upsert({
      where: { phrase },
      update: {},
      create: { phrase, type: "EXCLUDE" },
    });
  }

  console.log(
    `Seeded ${SUBREDDITS.length} subreddits, ${INCLUDE_PHRASES.length} include phrases, ${EXCLUDE_PHRASES.length} exclude phrases.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
