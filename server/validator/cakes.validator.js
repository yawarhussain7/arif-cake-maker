import { z } from 'zod'

export const createCakeSchema = z.object({
    cakename: z
        .string()
        .trim()
        .min(2, 'cake name is required')
        .max(100, 'cake name is less then 100 characters'),

    // Any category name the admin manages in /categories is accepted (the old
    // 5-value enum rejected freshly added categories).
    category: z
        .string()
        .trim()
        .min(2, 'Please select a valid cake category')
        .max(100, 'category name is less then 100 characters'),

    flavor: z
    .string()
    .trim()
    .min(1,'Cake flavor is required')
    .max(100,'flavor name is less then 100 characters'),

    price:z.coerce
    .number()
    .min(0,'Price must be a positive number'),

    stock:z.coerce
    .number()
    .int('Stock must be a whole number')
    .min(0,'stock cannot negative '),

    description:z
    .string()
    .trim()
    .max(2000,'Description cannot exced more then 2000 characters')
    .optional(),

    style: z.enum(
        [
            "Chocolate Cake",
            "Pink Cake",
            "Wedding Cake",
            "Cream Cake",
            "Velvet Cake",
            "Lemon Cake",
            "Other",
        ],
        { message: "Please select a valid cake style" }
    ).optional(),

    // Photo can arrive either as an uploaded file (multer sets req.file and the
    // controller stores the URL here) or directly as a URL string.
    photo: z
    .string()
    .trim()
    .min(1, 'Cake photo is required')
    .optional(),

    // No schema defaults here: the Mongoose model fills them on create, and on
    // partial updates a default would clobber the stored value (zod applies
    // defaults even through .partial()).
    isAvailable: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform(v => v === true || v === 'true')
    .optional()

})
export const updateCakeSchema = createCakeSchema.partial();