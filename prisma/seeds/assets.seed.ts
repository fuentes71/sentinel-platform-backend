import { PrismaClient } from '@prisma/client';

export async function seedAssets(prisma: PrismaClient) {
  console.log('Semeando ativos...');

  await prisma.asset.deleteMany({}); // Evita conflitos ao rodar várias vezes

  const asset1 = await prisma.asset.create({
    data: {
      name: 'Turbina Alpha',
      status: 'online',
    },
  });

  const asset2 = await prisma.asset.create({
    data: {
      name: 'Gerador Beta',
      status: 'offline',
      lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  });

  const asset3 = await prisma.asset.create({
    data: {
      name: 'Sistema de Resfriamento Gamma',
      status: 'online',
    },
  });

  console.log(`Ativos criados: ${asset1.name}, ${asset2.name}, ${asset3.name}`);

  return [asset1, asset2, asset3];
}
