import { PrismaClient, Asset } from '@prisma/client';

export async function seedEvents(prisma: PrismaClient, assets: Asset[]) {
  console.log('Semeando eventos...');

  const event1 = await prisma.event.create({
    data: {
      assetId: assets[0].id,
      type: 'metric',
      value: '45.5',
    },
  });

  const event2 = await prisma.event.create({
    data: {
      assetId: assets[1].id,
      type: 'status',
      value: 'offline',
    },
  });

  console.log(`Eventos criados: ${event1.id}, ${event2.id}`);
}
