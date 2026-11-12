import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export async function getSession() { return getServerSession(authOptions); }
export async function requireUser() {
  const session = await getSession();
  const id = (session?.user as any)?.id;
  if (!id) redirect('/login');
  // Reconsulta o perfil no banco para não confiar apenas no papel gravado no token da sessão.
  const user = await prisma.user.findUnique({ where: { id }, select: { id:true, name:true, email:true, role:true } });
  if (!user) redirect('/login');
  return user;
}
export async function requireRole(roles: Array<'CLIENT'|'STAFF'|'ADMIN'>) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect('/dashboard?erro=acesso');
  return user;
}
