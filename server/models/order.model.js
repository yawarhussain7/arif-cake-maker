import mongoose from 'mongoose'

const generateOrderNumber = () => {
    const d = new Date()
    const p = (n) => String(n).padStart(2, '0')
    return `ACM${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}${Math.floor(100 + Math.random() * 900)}`
}

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            unique: true,
            index: true,
            default: generateOrderNumber,
        },

        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },

        customerName: {
            type: String,
            trim: true,
            maxlength: 100,
            default: '',
        },

        customerEmail: {
            type: String,
            trim: true,
            lowercase: true,
            maxlength: 200,
            default: '',
        },

        items: [
            {
               
                cake: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Cake',
                    required: false,
                },

                name: {
                    type: String,
                    required: [true, 'Item name is required'],
                    trim: true,
                    maxlength: 200,
                },

                price: {
                    type: Number,
                    required: true,
                    min: [0, 'Price cannot be negative'],
                    default: 0
                },

                quantity: {
                    type: Number,
                    required: [true, 'Quantity is required'],
                    min: [1, 'Quantity must be at least 1'],
                    validate: {
                        validator: Number.isInteger,
                        message: 'Quantity must be a whole number',
                    }
                }
            }
        ],

        subtotal: {
            type: Number,
            required: true,
            min: [0, 'Subtotal cannot be negative'],
        },

        deliveryCharge: {
            type: Number,
            required: true,
            min: [0, 'Delivery charge cannot be negative'],
            default: 5,
        },

        totalAmount: {
            type: Number,
            required: [true, 'Total amount is required'],
            min: [0, 'Total amount cannot be negative'],
        },

        deliveryAddress: {
            type: String,
            required: [true, 'Delivery address is required'],
            trim: true,
            maxlength: 500,
        },

        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
            maxlength: 30,
        },

        // Preferred delivery day chosen in the storefront checkout.
        deliveryDate: {
            type: Date,
            default: null,
        },

        // Optional cake customization
        specialInstructions: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: '',
        },

        // Order lifecycle
        status: {
            type: String,
            enum: [
                'Pending',
                'Confirmed',
                'Preparing',
                'Out for Delivery',
                'Delivered',
                'Cancelled',
            ],
            default: 'Pending',
        },

        // Payment information
        paymentMethod: {
            type: String,
            enum: ['Cash on Delivery', 'Bank Transfer', 'Online'],
            default: 'Cash on Delivery',
        },

        paymentStatus: {
            type: String,
            enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
            default: 'Pending',
        },
    },
    {
        timestamps: true,
    }
)

orderSchema.index({ customer: 1, createdAt: -1 });

// Useful for admin order management
orderSchema.index({ status: 1, createdAt: -1 });

const OrderModel = mongoose.model('Order', orderSchema);

export default OrderModel
