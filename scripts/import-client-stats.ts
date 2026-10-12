/**
 * One-off import: reads clients.json and upserts WeeklyScorecard rows for every client.
 * Run with: npx tsx scripts/import-client-stats.ts
 *
 * Safe to re-run — uses upsert so existing rows won't be duplicated.
 */

import { config } from "dotenv";
config({ path: new URL("../.env", import.meta.url).pathname });

import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "fs";
import * as path from "path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

// ── Path to the clients.json export ─────────────────────────────────────────
// Update this if the file lives somewhere else on your machine.
const JSON_PATH = path.join(
  process.env.HOME!,
  "Library/Application Support/Claude/local-agent-mode-sessions/3506ab52-52a7-4641-992e-9d4070d04cb7/9cca88d2-6e35-4db9-a747-282bb24e4eb7/local_d0f884ff-6d21-4aea-9997-7efb716b54ad/outputs/data/clients.json"
);

type JsonWeek = {
  date: string;
  totalRevenue?: number | null;
  newEnquiries?: number | null;
  salesCallsBooked?: number | null;
  salesCallsConverted?: number | null;
  avgNewClientValue?: number | null;
  currentClients?: number | null;
  cancellationsPauses?: number | null;
  postsPublished?: number | null;
  dmsEnquiries?: number | null;
  followerGrowth?: number | null;
  bestPost?: string | null;
  hoursWorked?: number | null;
  energyScore?: number | null;
  biggestWin?: string | null;
  biggestBlock?: string | null;
};

type JsonClient = {
  id: string;
  name: string;
  weekly: JsonWeek[];
};

type JsonData = {
  clients: JsonClient[];
};

async function main() {
  if (!fs.existsSync(JSON_PATH)) {
    console.error("❌  clients.json not found at:", JSON_PATH);
    console.error("   Update JSON_PATH in the script to point to the file.");
    process.exit(1);
  }

  const data: JsonData = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"));

  // Fetch all client profiles so we can match by name
  const profiles = await prisma.clientProfile.findMany({
    select: { id: true, founderName: true },
  });

  console.log(`\nFound ${profiles.length} client profiles in the database`);
  console.log(`Found ${data.clients.length} clients in clients.json\n`);

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const jsonClient of data.clients) {
    // Match by founderName (case-insensitive, trimmed)
    const match = profiles.find(
      (p) => p.founderName.trim().toLowerCase() === jsonClient.name.trim().toLowerCase()
    );

    if (!match) {
      console.log(`⚠️   No match in DB for "${jsonClient.name}" — skipping`);
      totalSkipped += jsonClient.weekly.length;
      continue;
    }

    console.log(`✓  ${jsonClient.name} → profile ${match.id} (${jsonClient.weekly.length} weeks)`);

    for (const week of jsonClient.weekly) {
      // The date in the JSON is the week-start (Monday). Parse as UTC midnight.
      const weekStart = new Date(`${week.date}T00:00:00.000Z`);

      await prisma.weeklyScorecard.upsert({
        where: { clientProfileId_weekStart: { clientProfileId: match.id, weekStart } },
        create: {
          clientProfileId: match.id,
          weekStart,
          revenue:             week.totalRevenue ?? null,
          leads:               week.newEnquiries ?? null,
          callsBooked:         week.salesCallsBooked ?? null,
          callsConverted:      week.salesCallsConverted ?? null,
          avgClientValue:      week.avgNewClientValue ?? null,
          currentClients:      week.currentClients ?? null,
          cancellations:       week.cancellationsPauses ?? null,
          contentPieces:       week.postsPublished ?? null,
          contentEnquiries:    week.dmsEnquiries ?? null,
          followerGrowth:      week.followerGrowth ?? null,
          bestPerformingPost:  week.bestPost ?? null,
          hoursWorked:         week.hoursWorked ?? null,
          energyScore:         week.energyScore ?? null,
          biggestWin:          week.biggestWin ?? null,
          biggestBlock:        week.biggestBlock ?? null,
        },
        update: {
          revenue:             week.totalRevenue ?? null,
          leads:               week.newEnquiries ?? null,
          callsBooked:         week.salesCallsBooked ?? null,
          callsConverted:      week.salesCallsConverted ?? null,
          avgClientValue:      week.avgNewClientValue ?? null,
          currentClients:      week.currentClients ?? null,
          cancellations:       week.cancellationsPauses ?? null,
          contentPieces:       week.postsPublished ?? null,
          contentEnquiries:    week.dmsEnquiries ?? null,
          followerGrowth:      week.followerGrowth ?? null,
          bestPerformingPost:  week.bestPost ?? null,
          hoursWorked:         week.hoursWorked ?? null,
          energyScore:         week.energyScore ?? null,
          biggestWin:          week.biggestWin ?? null,
          biggestBlock:        week.biggestBlock ?? null,
        },
      });

      totalInserted++;
    }
  }

  console.log(`\n✅  Done — ${totalInserted} rows upserted, ${totalSkipped} skipped (no matching profile)`);
  console.log("   Refresh /client-stats in the founder portal to see the data.\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
