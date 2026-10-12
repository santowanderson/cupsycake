import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  cpf: z.string().length(11, 'CPF must contain exactly 11 digits'),
  email: z.string().email('Invalid email address'),
  areaCode: z.string().length(2),
  phoneNumber: z.string().min(8).max(9),
  gender: z
    .enum(['MALE', 'FEMALE', 'OTHER', 'NOT_SPECIFIED'])
    .default('NOT_SPECIFIED'),
  birthDate: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  address: z
    .object({
      zipCode: z.string().length(8),
      streetAddress: z.string().min(3).max(150),
      number: z.string().max(20),
      complement: z.string().optional(),
      neighborhood: z.string().max(100),
      city: z.string().max(100),
      stateCode: z.string().length(2),
      stateName: z.string().max(50),
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
