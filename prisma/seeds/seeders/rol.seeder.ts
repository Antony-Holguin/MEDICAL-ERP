import { PrismaClient } from '../../../src/generated/prisma/client';

const roles = [
  { code: 'admin', name: 'Administrador', description: 'Administrador del sistema', isSystem: true },
  { code: 'user', name: 'Usuario', description: 'Usuario estándar', isSystem: false },
  { code: 'client', name: 'Cliente', description: 'Usuario con permisos de cliente', isSystem: false },
  { code: 'accountant', name: 'Contador', description: 'Usuario con permisos de contador', isSystem: false },
  { code: 'auditor', name: 'Auditor', description: 'Usuario con permisos de auditoría', isSystem: true },
];

export async function rolSeeder(prisma: PrismaClient) {
  await prisma.rol.createMany({
    data: roles,
    skipDuplicates: true,
  });

  console.log(`  ✔ Roles (${roles.length})`);
}
