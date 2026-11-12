'use server';
import { hash } from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole, requireUser } from '@/lib/session';
import { registerSchema, serviceSchema } from '@/lib/validators';
import { QueueStatus, Role } from '@prisma/client';

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect('/cadastro?erro=' + encodeURIComponent(parsed.error.issues[0].message));
  const { name, email, password } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) redirect('/cadastro?erro=' + encodeURIComponent('Este e-mail já está cadastrado'));
  await prisma.user.create({ data: { name, email: email.toLowerCase(), passwordHash: await hash(password, 12), role: Role.CLIENT } });
  redirect('/login?criado=1');
}

export async function createQueueEntryAction(formData: FormData) {
  const user = await requireRole(['CLIENT']);
  const serviceId = String(formData.get('serviceId') || '');
  const service = await prisma.service.findFirst({ where: { id: serviceId, isActive: true }, include: { establishment: true } });
  if (!service) redirect('/estabelecimentos?erro=servico');
  const now = new Date(); const start = new Date(now); start.setHours(0,0,0,0); const end = new Date(start); end.setDate(end.getDate()+1);
  const result = await prisma.$transaction(async tx => {
    // Serializa a emissão por serviço e por usuário para evitar senhas repetidas em requisições simultâneas.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${serviceId}))`;
    const duplicate = await tx.queueEntry.findFirst({ where: { userId: user.id, serviceId, status: { in: [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_SERVICE] } } });
    if (duplicate) return { duplicateId: duplicate.id, entry: null };
    const count = await tx.queueEntry.count({ where: { serviceId, entryTime: { gte: start, lt: end } } });
    const ticketCode = `${service.codePrefix}-${String(count+1).padStart(3,'0')}`;
    const entry = await tx.queueEntry.create({ data: { ticketCode, userId: user.id, serviceId } });
    return { duplicateId: null, entry };
  });
  if (result.duplicateId) redirect('/filas/' + result.duplicateId + '?erro=duplicada');
  redirect('/filas/' + result.entry!.id);
}

export async function cancelQueueAction(formData: FormData) {
  const user = await requireRole(['CLIENT']); const id = String(formData.get('entryId') || '');
  const entry = await prisma.queueEntry.findFirst({ where: { id, userId: user.id, status: QueueStatus.WAITING } });
  if (!entry) redirect('/dashboard?erro=cancelamento');
  await prisma.queueEntry.update({ where: { id }, data: { status: QueueStatus.CANCELLED, endTime: new Date() } });
  revalidatePath('/dashboard'); revalidatePath('/filas/' + id); redirect('/dashboard?cancelada=1');
}

export async function advanceQueueAction(formData: FormData) {
  const user = await requireRole(['STAFF','ADMIN']); const entryId = String(formData.get('entryId') || ''); const action = String(formData.get('action') || '');
  const links = await prisma.staffEstablishment.findMany({ where: { userId: user.id }, select: { establishmentId: true } });
  const establishmentIds = links.map(x=>x.establishmentId);
  const entry = await prisma.queueEntry.findFirst({ where: { id: entryId, service: { establishmentId: { in: establishmentIds } } } });
  if (!entry) redirect('/staff?erro=permissao');
  if (action === 'start' && entry.status === QueueStatus.CALLED) await prisma.queueEntry.update({ where: { id: entryId }, data: { status: QueueStatus.IN_SERVICE, startTime: new Date(), staffId: user.id } });
  else if (action === 'complete' && entry.status === QueueStatus.IN_SERVICE) await prisma.queueEntry.update({ where: { id: entryId }, data: { status: QueueStatus.COMPLETED, endTime: new Date(), staffId: user.id } });
  else if (action === 'call' && entry.status === QueueStatus.WAITING) {
    await prisma.$transaction(async tx => {
      const first = await tx.queueEntry.findFirst({ where: { serviceId: entry.serviceId, status: QueueStatus.WAITING }, orderBy: { entryTime: 'asc' } });
      if (!first || first.id !== entryId) throw new Error('A fila foi atualizada. Tente novamente.');
      await tx.queueEntry.update({ where: { id: entryId }, data: { status: QueueStatus.CALLED, calledTime: new Date(), staffId: user.id } });
    });
  }
  revalidatePath('/staff'); revalidatePath('/dashboard');
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
export async function toggleServiceAction(formData: FormData) {
  const user = await requireRole(['ADMIN']); const id = String(formData.get('serviceId')||'');
  const link = await prisma.staffEstablishment.findFirst({ where: { userId: user.id } });
  const service = await prisma.service.findFirst({ where: { id, establishmentId: link?.establishmentId } });
  if (!service) redirect('/admin/servicos');
  await prisma.service.update({ where: { id }, data: { isActive: !service.isActive } });
  revalidatePath('/admin/servicos'); revalidatePath('/estabelecimentos');
}
export async function createStaffAction(formData: FormData) {
  const admin = await requireRole(['ADMIN']); const name=String(formData.get('name')||'').trim(); const email=String(formData.get('email')||'').trim().toLowerCase(); const password=String(formData.get('password')||'');
  const link = await prisma.staffEstablishment.findFirst({ where: { userId: admin.id } });
  if (!link || name.length<3 || !email.includes('@') || password.length<6) redirect('/admin/funcionarios?erro=validacao');
  const exists=await prisma.user.findUnique({where:{email}}); if(exists) redirect('/admin/funcionarios?erro=email');
  await prisma.user.create({ data:{ name,email,passwordHash:await hash(password,12),role:Role.STAFF,staffLinks:{create:{establishmentId:link.establishmentId}} } });
  revalidatePath('/admin/funcionarios'); redirect('/admin/funcionarios?salvo=1');
}
