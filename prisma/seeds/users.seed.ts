import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  console.log('Semeando usuários...');

  const adminEmail = 'admin@sentinel.com';
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'admin',
    },
  });
  console.log(`Usuário administrador criado: ${admin.email}`);

  const userEmail = 'user@sentinel.com';
  const userPasswordHash = await bcrypt.hash('user123', 10);

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      passwordHash: userPasswordHash,
      role: 'user',
    },
  });
  console.log(`Usuário padrão criado: ${user.email}`);

  return { admin, user };
}
