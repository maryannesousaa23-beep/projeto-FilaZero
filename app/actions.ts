'use server';
import { hash } from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole, requireUser } from '@/lib/session';
import { registerSchema, serviceSchema, staffSchema } from '@/lib/validators';
import { QueueStatus, Role } from '@prisma/client';
import { dayRangeUTC, ticketNumber } from '@/lib/queue-rules';

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect('/cadastro?erro=' + encodeURIComponent(parsed.error.issues[0].message));
  const { name, email, password } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) redirect('/cadastro?erro=' + encodeURIComponent('Este e-mail já está cadastrado'));
  try {
    await prisma.user.create({ data: { name, email: email.toLowerCase(), passwordHash: await hash(password, 12), role: Role.CLIENT } });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      redirect('/cadastro?erro=' + encodeURIComponent('Este e-mail já está cadastrado'));
    }
    throw error;
  }
  redirect('/login?criado=1');
}

export async function createQueueEntryAction(formData: FormData) {
  const user = await requireRole(['CLIENT']);
  const serviceId = String(formData.get('serviceId') || '');
  const service = await prisma.service.findFirst({ where: { id: serviceId, isActive: true }, include: { establishment: true } });
  if (!service) redirect('/estabelecimentos?erro=servico');
  const { start, end } = dayRangeUTC(new Date());
  const result = await prisma.$transaction(async tx => {
    // Serializa a emissão por serviço e por usuário para evitar senhas repetidas em requisições simultâneas.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${serviceId}))`;
    const duplicate = await tx.queueEntry.findFirst({ where: { userId: user.id, serviceId, status: { in: [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_SERVICE] } } });
    if (duplicate) return { duplicateId: duplicate.id, entry: null };
    const count = await tx.queueEntry.count({ where: { serviceId, entryTime: { gte: start, lt: end } } });
    const ticketCode = ticketNumber(count + 1, service.codePrefix);
    const entry = await tx.queueEntry.create({ data: { ticketCode, userId: user.id, serviceId } });
    return { duplicateId: null, entry };
  });
  if (result.duplicateId) redirect('/filas/' + result.duplicateId + '?erro=duplicada');
  redirect('/filas/' + result.entry!.id);
}

export async function cancelQueueAction(formData: FormData) {
  const user = await requireRole(['CLIENT']);
  const id = String(formData.get('entryId') || '');
  // Comparação e gravação na mesma instrução: evita cancelar uma senha já chamada em paralelo.
  const changed = await prisma.queueEntry.updateMany({
    where: { id, userId: user.id, status: QueueStatus.WAITING },
    data: { status: QueueStatus.CANCELLED, endTime: new Date() },
  });
  if (!changed.count) redirect('/dashboard?erro=cancelamento');
  revalidatePath('/dashboard'); revalidatePath('/filas/' + id);
  redirect('/dashboard?cancelada=1');
}

export async function advanceQueueAction(formData: FormData) {
  const user = await requireRole(['STAFF', 'ADMIN']);
  const entryId = String(formData.get('entryId') || '');
  const operation = String(formData.get('action') || '');
  if (!['call', 'start', 'complete'].includes(operation)) redirect('/staff?erro=acao');
  const links = await prisma.staffEstablishment.findMany({
    where: { userId: user.id }, select: { establishmentId: true },
  });
  const establishmentIds = links.map(link => link.establishmentId);
  const entry = await prisma.queueEntry.findFirst({
    where: { id: entryId, service: { establishmentId: { in: establishmentIds } } },
    select: { id: true, serviceId: true },
  });
  if (!entry) redirect('/staff?erro=permissao');

  // Todos os operadores do mesmo serviço usam a mesma trava transacional,
  // protegendo as chamadas simultâneas e impedindo saltos na ordem da fila.
  const result = await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${entry.serviceId}))`;
    if (operation === 'call') {
      const ongoing = await tx.queueEntry.findFirst({
        where: { serviceId: entry.serviceId, status: { in: [QueueStatus.CALLED, QueueStatus.IN_SERVICE] } },
      });
      if (ongoing) return false;
      const first = await tx.queueEntry.findFirst({
        where: { serviceId: entry.serviceId, status: QueueStatus.WAITING },
        orderBy: [{ entryTime: 'asc' }, { id: 'asc' }],
      });
      if (!first || first.id !== entryId) return false;
      const changed = await tx.queueEntry.updateMany({
        where: { id: entryId, status: QueueStatus.WAITING },
        data: { status: QueueStatus.CALLED, calledTime: new Date(), staffId: user.id },
      });
      return changed.count === 1;
    }
    if (operation === 'start') {
      const changed = await tx.queueEntry.updateMany({
        where: { id: entryId, status: QueueStatus.CALLED, staffId: user.id },
        data: { status: QueueStatus.IN_SERVICE, startTime: new Date() },
      });
      return changed.count === 1;
    }
    const changed = await tx.queueEntry.updateMany({
      where: { id: entryId, status: QueueStatus.IN_SERVICE, staffId: user.id },
      data: { status: QueueStatus.COMPLETED, endTime: new Date() },
    });
    return changed.count === 1;
  });
  revalidatePath('/staff'); revalidatePath('/dashboard');
  if (!result) redirect('/staff?erro=fila-atualizada');
}

export async function createServiceAction(formData: FormData) {
  const user = await requireRole(['ADMIN']);
  const parsed = serviceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect('/admin/servicos?erro=' + encodeURIComponent(parsed.error.issues[0].message));
  const link = await prisma.staffEstablishment.findFirst({ where: { userId: user.id } });
  if (!link) redirect('/admin?erro=sem-estabelecimento');
  await prisma.service.create({ data: { ...parsed.data, establishmentId: link.establishmentId, description: parsed.data.description || null } });
  revalidatePath('/admin/servicos'); revalidatePath('/estabelecimentos'); redirect('/admin/servicos?salvo=1');
}
export async function updateServiceAction(formData: FormData) {
  const user = await requireRole(['ADMIN']);
  const id = String(formData.get('serviceId') || '');
  const parsed = serviceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success || !id) redirect('/admin/servicos?erro=' + encodeURIComponent(parsed.success ? 'Serviço inválido.' : parsed.error.issues[0].message));
  const link = await prisma.staffEstablishment.findFirst({ where: { userId: user.id } });
  if (!link) redirect('/admin/servicos?erro=sem-estabelecimento');
  const service = await prisma.service.findFirst({ where: { id, establishmentId: link.establishmentId } });
  if (!service) redirect('/admin/servicos?erro=permissao');
  await prisma.service.update({
    where: { id },
    data: { ...parsed.data, description: parsed.data.description || null },
  });
  revalidatePath('/admin/servicos');
  revalidatePath('/estabelecimentos');
  revalidatePath('/staff');
  redirect('/admin/servicos?atualizado=1');
}

export async function toggleServiceAction(formData: FormData) {
  const user = await requireRole(['ADMIN']); const id = String(formData.get('serviceId')||'');
  const link = await prisma.staffEstablishment.findFirst({ where: { userId: user.id } });
  const service = await prisma.service.findFirst({ where: { id, establishmentId: link?.establishmentId } });
  if (!service) redirect('/admin/servicos');
  await prisma.service.update({ where: { id }, data: { isActive: !service.isActive } });
  revalidatePath('/admin/servicos'); revalidatePath('/estabelecimentos');
}
export async function createStaffAction(formData: FormData) {
  const admin = await requireRole(['ADMIN']);
  const parsed = staffSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect('/admin/funcionarios?erro=validacao');
  const { name, email } = parsed.data;
  const password = parsed.data.password;
  const link = await prisma.staffEstablishment.findFirst({ where: { userId: admin.id } });
  if (!link) redirect('/admin/funcionarios?erro=sem-estabelecimento');
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) redirect('/admin/funcionarios?erro=email');
  try {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hash(password, 12),
        role: Role.STAFF,
        staffLinks: { create: { establishmentId: link.establishmentId } },
      },
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      redirect('/admin/funcionarios?erro=email');
    }
    throw error;
  }
  revalidatePath('/admin/funcionarios');
  redirect('/admin/funcionarios?salvo=1');
}
