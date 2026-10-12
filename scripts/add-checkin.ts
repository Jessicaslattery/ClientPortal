import { config } from "dotenv";
config({ path: new URL("../.env", import.meta.url).pathname });

import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const weekStart = new Date("2026-09-14T00:00:00.000Z");
  const clientProfileId = "cmu50ci640007yvzzh913ogzh"; // Laura Perks

  await prisma.weeklyScorecard.upsert({
    where: { clientProfileId_weekStart: { clientProfileId, weekStart } },
    create: {
      clientProfileId,
      weekStart,
      revenue:            3550,  // $1,400 PT + $1,250 online + $900 teaching
      leads:              1,
      callsBooked:        1,
      callsConverted:     0,
      avgClientValue:     null,
      currentClients:     23,    // 18 PT + 5 online
      cancellations:      1,
      contentPieces:      5,
      contentEnquiries:   null,
      followerGrowth:     270,
      bestPerformingPost: "Atlas cat post — 389,558 views | 1,400 saves | 39.2k likes",
      hoursWorked:        49,    // 39h PT + 3h online + 7h teaching
      energyScore:        6,
      biggestWin:         "Viral post with Atlas",
      biggestBlock:       "Career skyrocketing, private life struggling",
    },
    update: {
      revenue:            3550,
      leads:              1,
      callsBooked:        1,
      callsConverted:     0,
      currentClients:     23,
      cancellations:      1,
      contentPieces:      5,
      followerGrowth:     270,
      bestPerformingPost: "Atlas cat post — 389,558 views | 1,400 saves | 39.2k likes",
      hoursWorked:        49,
      energyScore:        6,
      biggestWin:         "Viral post with Atlas",
      biggestBlock:       "Career skyrocketing, private life struggling",
    },
  });

  console.log("✅  Laura Perks — week of 2026-09-14 saved ($3,550 revenue, 270 follower growth, viral Atlas post)");
}

main().catch(console.error).finally(() => prisma.$disconnect());
