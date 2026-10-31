import { z } from 'zod'

export const createCategorySchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'category name is required')
        .max(100, 'category name is less then 100 characters'),

    description: z
        .string()
        .trim()
        .max(500, 'Description cannot exced more then 500 characters')
        .optional(),

    color: z
        .string()
        .trim()
        .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Color must be a hex value like #a9663f')
        .optional(),

    // Field names match models/category.model.js (shareOfOrders / chartColor).
    shareOfOrders: z.coerce
        .number()
        .int('Share of orders must be a whole number')
        .min(0, 'Share of orders cannot be negative')
        .max(100, 'Share of orders cannot exceed 100')
        .optional(),

    chartColor: z
        .string()
        .trim()
        .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Color must be a hex value like #a9663f')
        .optional(),
})

// No defaults here: on partial updates a default would clobber the stored value
// (zod applies defaults even through .partial()).
export const updateCategorySchema = createCategorySchema.partial()
