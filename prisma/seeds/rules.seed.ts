import { PrismaClient, Asset } from '@prisma/client';

export async function seedRules(prisma: PrismaClient, assets: Asset[]) {
  console.log('Semeando regras...');

  const rule1 = await prisma.rule.create({
    data: {
      assetId: assets[0].id,
      condition: '>',
      threshold: 90,
      level: 'strong',
      enabled: true,
    },
  });

  const globalRule = await prisma.rule.create({
    data: {
      assetId: null,
      condition: '<',
      threshold: 10,
      level: 'medium',
      enabled: true,
    },
  });

  console.log(`Regras criadas: ${rule1.id} (Ativo ${assets[0].name}), ${globalRule.id} (Global)`);
}
