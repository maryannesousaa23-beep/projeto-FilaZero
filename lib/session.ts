import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
export async function getSession() { return getServerSession(authOptions); }
export async function requireUser() {
  const session = await getSession();
  if (!session?.user) redirect('/login');
  return session.user as typeof session.user & { id: string; role: 'CLIENT'|'STAFF'|'ADMIN' };
}
export async function requireRole(roles: Array<'CLIENT'|'STAFF'|'ADMIN'>) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect('/dashboard?erro=acesso');
  return user;
}
