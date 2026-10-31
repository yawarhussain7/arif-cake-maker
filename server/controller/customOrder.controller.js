import {
    createCustomOrder,
    getAllCustomOrders,
    getCustomOrderById,
    updateCustomOrderStatus,
    cancelCustomOrder,
} from '../services/customOrder.service.js'
import { sendresponse } from '../utils/response.js'
import AppError from '../utils/AppError.js'

export const createCustomOrderController = async (req, res, next) => {
    try {
        const {
            customerName,
            customerEmail,
            customerPhone,
            cakeSize,
            flavor,
            occasion,
            quantity,
            specialInstructions,
            deliveryAddress,
            deliveryDate,
        } = req.body

        const referenceImage = req.file ? `/uploads/custom-orders/${req.file.filename}` : undefined

        const order = await createCustomOrder({
            customerId: req.user?.id ?? null,
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
        })

        return sendresponse(req, res, 201, true, 'Custom cake order created successfully', order)
    } catch (error) {
        next(error)
    }
}

export const getAllCustomOrdersController = async (req, res, next) => {
    try {
        const orders = await getAllCustomOrders()
        return sendresponse(req, res, 200, true, 'Custom orders fetched successfully', orders)
    } catch (error) {
        next(error)
    }
}

export const getCustomOrderByIdController = async (req, res, next) => {
    try {
        const order = await getCustomOrderById(req.params.id)
        return sendresponse(req, res, 200, true, 'Custom order fetched successfully', order)
    } catch (error) {
        next(error)
    }
}

export const updateCustomOrderStatusController = async (req, res, next) => {
    try {
        const { status } = req.body
        const order = await updateCustomOrderStatus(req.params.id, status, req.user?.id)
        return sendresponse(req, res, 200, true, 'Custom order status updated successfully', order)
    } catch (error) {
        next(error)
    }
}

export const cancelCustomOrderController = async (req, res, next) => {
    try {
        await cancelCustomOrder(req.params.id)
        return sendresponse(req, res, 200, true, 'Custom order cancelled successfully')
    } catch (error) {
        next(error)
    }
}
