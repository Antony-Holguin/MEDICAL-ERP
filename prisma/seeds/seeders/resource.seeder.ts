import { PrismaClient } from '../../../src/generated/prisma/client';

export async function resourceSeeder(prisma: PrismaClient) {
  const resources = ['users', 'roles', 'permission'];

  await prisma.resource.createMany({
    data: resources.map((name) => ({ name })),
    skipDuplicates: true,
  });

  console.log(`  ✔ Resources (${resources.length})`);
}
