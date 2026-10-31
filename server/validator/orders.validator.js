import { z } from 'zod'

const objectId = z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid id')

export const createOrderSchema = z.object({
    // Every item needs a name/price/quantity; `cake` is optional so custom
    // (off-catalogue) cakes can be ordered too.
    items: z
        .array(
            z.object({
                cake: objectId.optional(),
                name: z.string().trim().min(1, 'Item name is required').max(200),
                price: z.coerce.number().min(0, 'Price cannot be negative'),
                quantity: z.coerce
                    .number()
                    .int('Quantity must be a whole number')
                    .min(1, 'Quantity must be at least 1'),
            })
        )
        .min(1, 'Order must contain at least one item'),

    deliveryAddress: z
        .string()
        .trim()
        .min(5, 'Delivery address is required')
        .max(500, 'Delivery address cannot exceed 500 characters')
        .refine(
          (val) => /karachi/i.test(val),
          { message: 'Delivery address must be within Karachi, Pakistan.' }
        ),

    phone: z
        .string()
        .trim()
        .min(7, 'Please enter a valid phone number')
        .max(30, 'Phone number cannot exceed 30 characters'),

    // City restricted to Karachi — we only deliver within Karachi.
    city: z
        .string()
        .trim()
        .min(1, 'City is required')
        .refine(
          (val) => val.toLowerCase() === 'karachi',
          { message: 'We currently only deliver within Karachi.' }
        ),

    // Preferred delivery day (YYYY-MM-DD from the checkout date input).
    deliveryDate: z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Delivery date must be YYYY-MM-DD')
        .optional()
        .nullable(),

    specialInstructions: z
        .string()
        .trim()
        .max(1000, 'Notes cannot exceed 1000 characters')
        .optional(),

    paymentMethod: z
        .enum(['Cash on Delivery', 'Bank Transfer', 'Online'], {
            message: 'Please select a valid payment method',
        })
        .optional(),

    // Guest checkout: captured in the checkout form. Ignored by the controller
    // when the customer is signed in (the account details win).
    customerName: z
        .string()
        .trim()
        .min(2, 'Please enter your full name')
        .max(100)
        .optional(),

    customerEmail: z
        .string()
        .trim()
        .email('Please enter a valid email address')
        .max(200)
        .optional(),
})

export const updateOrderStatusSchema = z.object({
    status: z.enum(
        ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
        { message: 'Please select a valid status' }
    ),
})
