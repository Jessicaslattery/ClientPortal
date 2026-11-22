import { prisma } from "../src/lib/db";

async function main() {
  // Delete all client profiles (cascades to tasks, goals, check-ins, wins, calls, messages, etc.)
  const profiles = await prisma.clientProfile.deleteMany({});
  console.log(`Deleted ${profiles.count} client profiles`);

  // Delete all client/sms users
  const users = await prisma.user.deleteMany({
    where: { role: { in: ["client", "sms_client"] } },
  });
  console.log(`Deleted ${users.count} client users`);

  // Clear announcements
  const announcements = await prisma.announcement.deleteMany({});
  console.log(`Deleted ${announcements.count} announcements`);

  console.log("\n✓ All client data wiped. Founder account untouched.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
