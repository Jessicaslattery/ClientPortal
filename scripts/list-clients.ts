import { prisma } from '../src/lib/db';

async function main() {
  const clients = await prisma.clientProfile.findMany({ 
    select: { id: true, founderName: true, businessName: true, email: true } 
  });
  console.log(JSON.stringify(clients, null, 2));
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
