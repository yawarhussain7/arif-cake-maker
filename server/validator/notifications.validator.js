import { z } from 'zod'

// Same values as the enum in models/notification.model.js.
const TYPES = ['info', 'success', 'warning', 'error', 'order', 'payment', 'system']

export const createNotificationSchema = z.object({
    // Target user; optional — the controller falls back to the session user.
    userId: z
        .string()
        .trim()
        .regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid id')
        .optional(),

    title: z
        .string()
        .trim()
        .min(3, 'title must be more the 3 characters')
        .max(150, 'title must be less then 150 characters'),

    message: z
        .string()
        .trim()
        .min(1, 'message is required')
        .max(1000, 'message cannot exceed 1000 characters'),

    type: z.enum(TYPES, { message: 'Please select a valid notification type' }).optional(),

    metadata: z
        .record(z.string(), z.unknown())
        .optional(),
})
