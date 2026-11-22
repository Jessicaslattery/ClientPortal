import { prisma } from '../src/lib/db';

async function main() {
  const testEmails = [
    'test@pivotco.com',
    'test@gmail.com',
    'demo@consultportal.test',
    'demo@smsportal.test',
  ];

  for (const email of testEmails) {
    const user = await prisma.user.findUnique({ where: { email }, include: { clientProfile: true } });
    if (!user) { console.log(`Not found: ${email}`); continue; }

    // Delete messages sent by this user (FK constraint)
    await prisma.message.deleteMany({ where: { senderId: user.id } });

    // Delete sessions
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    await prisma.user.delete({ where: { id: user.id } });
    console.log(`Deleted: ${email} (${user.name})`);
  }
  await prisma.$disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
