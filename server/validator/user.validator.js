import { z } from "zod"
import { isDisposableEmail } from '../utils/disposableEmail.js'

export const registerUserSchema = z.object({
    username: z
        .string()
        .trim()
        .min(3, 'username must be atlest 3 characters')
        .max(50, 'username cannot more then 50 characters'),

    email: z
        .string()
        .trim()
        .email("Please enter a valid email address")
        .transform((value) => value.toLowerCase())
        .refine((value) => !isDisposableEmail(value), {
            message: 'Disposable/temporary email addresses are not allowed. Please use a permanent email.',
        }),

    password: z
        .string()
        .trim()
        .min(6,'please enter atleast 6 characters')
        .max(70,'password cannot exced more then 72 characters')

})

export const loginUserSchema = z.object({
  email: z.string()
    .trim()
    .email("Please enter a valid email address")
    .transform((value) => value.toLowerCase()),

  password: z.string()
    .min(1, "Password is required")
    .max(72, "Password cannot exceed 72 characters"),
});