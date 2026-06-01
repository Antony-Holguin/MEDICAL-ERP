import { PrismaClient } from '../../../src/generated/prisma/client';
import { ActionType } from '../../../src/generated/prisma/enums';

const actions = Object.values(ActionType);

export async function permissionSeeder(prisma: PrismaClient) {
  const resources = await prisma.resource.findMany();
  const adminRole = await prisma.rol.findUnique({ where: { code: 'admin' } });

  for (const resource of resources) {
    await prisma.permission.createMany({
      data: actions.map((action) => ({ resourceId: resource.id, action })),
      skipDuplicates: true,
    });
  }

  const allPermissions = await prisma.permission.findMany();

  await prisma.rolHasPermission.createMany({
    data: allPermissions.map((p) => ({ rolId: adminRole.id, permissionId: p.id })),
    skipDuplicates: true,
  });

  console.log(`  ✔ Permissions (${resources.length} resources × ${actions.length} actions)`);
  console.log(`  ✔ RolHasPermission (admin → all permissions)`);
}
