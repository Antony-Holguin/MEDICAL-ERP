import { PrismaClient } from '../../src/generated/prisma/client';
import { resourceSeeder } from './seeders/resource.seeder';
import { rolSeeder } from './seeders/rol.seeder';
import { permissionSeeder } from './seeders/permission.seeder';

const prisma = new PrismaClient();

/**
 * Agrega aquí los seeders en el orden correcto.
 * El orden importa: si un seeder depende de datos de otro, debe ir después.
 *
 * Ejemplo: permissionSeeder depende de resource y rol, por eso va de último.
 */
const seeders: Array<(prisma: PrismaClient) => Promise<void>> = [
  resourceSeeder,
  rolSeeder,
  permissionSeeder,
  // agrega más seeders aquí
];

async function main() {
  console.log('🌱 Iniciando seeds...\n');

  for (const seeder of seeders) {
    await seeder(prisma);
  }

  console.log('\n✅ Seeds completados');
}

main()
  .catch((e) => {
    console.error('❌ Error en seeds:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
