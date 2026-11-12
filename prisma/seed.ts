import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const name = process.env.SEED_ADMIN_NAME || 'Administrador FilaZero';
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@filazero.local').toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const establishmentName = process.env.SEED_ESTABLISHMENT_NAME || 'FilaZero - Estabelecimento Principal';
  const establishmentAddress = process.env.SEED_ESTABLISHMENT_ADDRESS || 'Endereço não cadastrado';

  const establishment = await prisma.establishment.upsert({
    where: { id: 'filazero-seed-establishment' },
    update: { name: establishmentName, address: establishmentAddress },
    create: {
      id: 'filazero-seed-establishment',
      name: establishmentName,
      address: establishmentAddress,
    },
  });

  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  if (password && password.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD deve ter pelo menos 12 caracteres.');
  }
  if (!password && !existingAdmin) {
    throw new Error('SEED_ADMIN_PASSWORD é obrigatório na primeira criação do administrador.');
  }

  const passwordHash = password ? await hash(password, 12) : undefined;
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: Role.ADMIN,
      ...(passwordHash ? { passwordHash } : {}),
    },
    create: {
      name,
      email,
      passwordHash: passwordHash!,
      role: Role.ADMIN,
    },
  });

  await prisma.staffEstablishment.upsert({
    where: {
      userId_establishmentId: {
        userId: admin.id,
        establishmentId: establishment.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      establishmentId: establishment.id,
    },
  });

  await prisma.service.upsert({
    where: { id: 'filazero-seed-service' },
    update: {
      establishmentId: establishment.id,
      isActive: true,
    },
    create: {
      id: 'filazero-seed-service',
      establishmentId: establishment.id,
      name: 'Atendimento Geral',
      description: 'Atendimento geral e informações',
      estimatedMinutes: 10,
      codePrefix: 'ATD',
      isActive: true,
    },
  });

  console.log(`Administrador inicial pronto: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
