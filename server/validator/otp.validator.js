import { z } from "zod"

export const sendOtpSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Please enter a valid email address")
        .transform((value) => value.toLowerCase()),
})

export const verifyOtpSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Please enter a valid email address")
        .transform((value) => value.toLowerCase()),
    otp: z
        .string()
        .trim()
        .length(6, "OTP must be exactly 6 digits")
        .regex(/^\d{6}$/, "OTP must contain only digits"),
})