import { PrismaClient, Asset, User } from '@prisma/client';

export async function seedAlerts(prisma: PrismaClient, assets: Asset[], admin: User) {
  console.log('Semeando alertas...');

  const alert1 = await prisma.alert.create({
    data: {
      assetId: assets[0].id,
      level: 'warning',
      message: 'A temperatura está subindo progressivamente acima de 80 graus',
    },
  });

  const alert2 = await prisma.alert.create({
    data: {
      assetId: assets[1].id,
      level: 'critical',
      message: 'O gerador ficou offline inesperadamente',
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy: admin.id,
    },
  });

  console.log(`Alertas criados: ${alert1.id} (Ativo), ${alert2.id} (Resolvido)`);
}
