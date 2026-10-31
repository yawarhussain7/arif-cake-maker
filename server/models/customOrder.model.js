import mongoose from 'mongoose'

const generateOrderNumber = () => {
    const d = new Date()
    const p = (n) => String(n).padStart(2, '0')
    return `ACM${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}${Math.floor(100 + Math.random() * 900)}`
}

const customOrderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        index: true,
        default: generateOrderNumber,
    },
    customerName: {
        type: String,
        trim: true,
        maxlength: 100,
        required: [true, 'Customer name is required'],
    },
    customerEmail: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 200,
        default: '',
    },
    customerPhone: {
        type: String,
        trim: true,
        maxlength: 30,
        required: [true, 'Phone number is required'],
    },
    referenceImage: {
        type: String,
        required: [true, 'Reference image is required'],
    },
    cakeSize: {
        type: String,
        required: [true, 'Cake size is required'],
    },
    flavor: {
        type: String,
        required: [true, 'Flavor is required'],
    },
    occasion: {
        type: String,
        required: [true, 'Occasion is required'],
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1,
    },
    specialInstructions: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: '',
    },
    deliveryAddress: {
        type: String,
        trim: true,
        maxlength: 500,
        required: [true, 'Delivery address is required'],
    },
    deliveryDate: {
        type: Date,
        default: null,
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
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    adminNotes: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: '',
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    approvedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
})

customOrderSchema.index({ customerName: 1, createdAt: -1 })
customOrderSchema.index({ status: 1, createdAt: -1 })

const CustomOrderModel = mongoose.model('CustomOrder', customOrderSchema)
export default CustomOrderModel
