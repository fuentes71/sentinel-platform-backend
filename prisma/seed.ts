import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { seedUsers } from './seeds/users.seed';
import { seedAssets } from './seeds/assets.seed';
import { seedRules } from './seeds/rules.seed';
import { seedEvents } from './seeds/events.seed';
import { seedAlerts } from './seeds/alerts.seed';

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const dbPath = dbUrl.replace('file:', '');
const adapter = new PrismaBetterSqlite3({ url: dbPath });

const prisma = new PrismaClient({ adapter });
async function main() {
  console.log('Iniciando o seeder...');

  // --- SEED ORCHESTRATION ---
  const { admin } = await seedUsers(prisma);
  const assets = await seedAssets(prisma);
  
  await seedRules(prisma, assets);
  await seedEvents(prisma, assets);
  await seedAlerts(prisma, assets, admin);

  console.log('Seeding finalizado com sucesso.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Erro durante o seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
