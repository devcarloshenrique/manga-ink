import { z } from 'zod'

export const registerSchema = z
  .object({
    username: z.string().min(3, 'Nome de usuário deve ter no mínimo 3 caracteres'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z
      .string()
      .min(6, 'Confirmação de senha deve ter no mínimo 6 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  })

export type RegisterDTO = z.infer<typeof registerSchema>
