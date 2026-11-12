import { z } from 'zod';
export const registerSchema = z.object({ name: z.string().trim().min(3,'Informe seu nome completo.').max(120), email: z.string().trim().email('Informe um e-mail válido.').max(180), password: z.string().min(6,'A senha deve ter pelo menos 6 caracteres.').max(72) });
export const serviceSchema = z.object({ name: z.string().trim().min(2).max(100), description: z.string().trim().max(1000).optional(), estimatedMinutes: z.coerce.number().int().min(1).max(240), codePrefix: z.string().trim().regex(/^[A-Z]{2,5}$/,'Use de 2 a 5 letras maiúsculas.') });
