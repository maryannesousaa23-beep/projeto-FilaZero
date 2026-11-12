import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [CredentialsProvider({
    name: 'E-mail e senha',
    credentials: { email: { label: 'E-mail', type: 'email' }, password: { label: 'Senha', type: 'password' } },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password) return null;
      const user = await prisma.user.findUnique({ where: { email: credentials.email.toLowerCase().trim() } });
      if (!user || !(await compare(credentials.password, user.passwordHash))) return null;
      return { id: user.id, name: user.name, email: user.email, role: user.role } as any;
    }
  })],
  callbacks: {
    async jwt({ token, user }) { if (user) { token.uid = user.id; token.role = (user as any).role; } return token; },
    async session({ session, token }) { if (session.user) { (session.user as any).id = token.uid; (session.user as any).role = token.role; } return session; }
  }
};
