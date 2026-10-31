import CustomOrderModel from '../models/customOrder.model.js'
import AppError from '../utils/AppError.js'
import { notifyAdmins, createNotification } from '../services/notification.service.js'

const deliveryCharge = () => {
    const charge = Number(process.env.DELIVERY_CHARGE ?? 300)
    if (!Number.isFinite(charge) || charge < 0) {
        throw new Error('Invalid delivery charge')
    }
    return charge
}

const CUSTOM_CAKE_PRICES = {
    '1 kg': 2500,
    '2 kg': 4500,
    '3 kg': 6500,
    '5 kg': 10500,
}

export const createCustomOrder = async ({
    customerName,
    customerEmail,
    customerPhone,
    referenceImage,
    cakeSize,
    flavor,
    occasion,
    quantity,
    specialInstructions,
    deliveryAddress,
    deliveryDate,
    customerId = null,
}) => {
    if (!customerName || !customerPhone || !referenceImage || !cakeSize || !flavor || !occasion || !deliveryAddress) {
        throw new AppError('All required fields must be provided', 400)
    }

    const delivery_charge = deliveryCharge()
    const quantityNum = Math.max(1, Number(quantity) || 1)
    const basePrice = CUSTOM_CAKE_PRICES[cakeSize]
    if (!basePrice) {
        throw new AppError('Please select a valid cake size', 400)
    }
    const subtotal = Number((basePrice * quantityNum).toFixed(2))
    const totalAmount = Number((subtotal + delivery_charge).toFixed(2))

    const customOrder = await CustomOrderModel.create({
        customer: customerId || undefined,
        customerName,
        customerEmail,
        customerPhone,
        referenceImage,
        cakeSize,
        flavor,
        occasion,
        quantity: quantityNum,
        specialInstructions: specialInstructions || '',
        deliveryAddress,
        deliveryDate: deliveryDate || null,
        deliveryCharge: delivery_charge,
        totalAmount,
        status: 'Pending',
    })

    await notifyAdmins({
        title: `New custom cake order ${customOrder.orderNumber}`,
        message: `${customerName} requested a custom ${flavor} cake for ${occasion}`,
        type: 'order',
        metadata: {
            orderId: String(customOrder._id),
            orderNumber: customOrder.orderNumber,
            type: 'custom',
        },
    })

    return customOrder
}

export const getAllCustomOrders = async () => {
    return await CustomOrderModel.find().sort({ createdAt: -1 })
}

export const getCustomOrderById = async (id) => {
    const order = await CustomOrderModel.findById(id)
    if (!order) {
        throw new AppError('Custom order not found', 404)
    }
    return order
}

export const updateCustomOrderStatus = async (id, status, adminId) => {
    const validTransitions = {
        Pending: ['Confirmed', 'Cancelled'],
        Confirmed: ['Preparing', 'Cancelled'],
        Preparing: ['Out for Delivery', 'Cancelled'],
        'Out for Delivery': ['Delivered'],
        Delivered: [],
        Cancelled: [],
    }

    const order = await CustomOrderModel.findById(id)
    if (!order) {
        throw new AppError('Custom order not found', 404)
    }

    if (status === 'Cancelled') {
        order.status = 'Cancelled'
        await order.save()
        return order
    }

    if (!validTransitions[order.status]?.includes(status)) {
        throw new AppError(`Cannot change status from "${order.status}" to "${status}"`, 400)
    }

    order.status = status
    if (status === 'Confirmed' && adminId) {
        order.approvedBy = adminId
        order.approvedAt = new Date()
    }
    await order.save()
    return order
}

export const cancelCustomOrder = async (id) => {
    const order = await CustomOrderModel.findByIdAndDelete(id)
    if (!order) {
        throw new AppError('Custom order not found', 404)
    }
    return order
}
