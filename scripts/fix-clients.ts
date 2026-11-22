import { prisma } from '../src/lib/db';

async function main() {
  // Fix H&L Pipelines by ID
  await prisma.clientProfile.update({
    where: { id: 'cmv4ttn0100012izzyzyf7hls' },
    data: { currentMonth: 2, currentWeek: 1 },
  });
  console.log('Updated H&L to month 2');

  // Remove Jess Slattery client account by ID
  const jessUser = await prisma.user.findUnique({ where: { email: 'jess@pivotco.com.au' } });
  if (jessUser) {
    await prisma.message.deleteMany({ where: { senderId: jessUser.id } });
    await prisma.session.deleteMany({ where: { userId: jessUser.id } });
    await prisma.user.delete({ where: { id: jessUser.id } });
    console.log('Deleted Jess Slattery client account');
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
