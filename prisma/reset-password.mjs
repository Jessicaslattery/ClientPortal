import { createRequire } from 'module';
import { readFileSync } from 'fs';

// Load .env manually
const env = readFileSync('.env', 'utf8');
for (const line of env.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
}

const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../src/generated/prisma/index.js');

const prisma = new PrismaClient();
const hash = await bcrypt.hash('PivotCo2024!', 10);

const updated = await prisma.user.updateMany({
  where: { role: 'founder' },
  data: { password: hash },
});

const users = await prisma.user.findMany({ select: { email: true, role: true } });
console.log('Users in db:', users);
console.log(`Updated ${updated.count} founder account(s)`);
console.log('New password: PivotCo2024!');
await prisma.$disconnect();
