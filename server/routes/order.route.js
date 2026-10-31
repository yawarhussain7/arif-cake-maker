import express from 'express'
import validate from '../middleware/validate.middleware.js'
import { createOrderSchema, updateOrderStatusSchema } from '../validator/orders.validator.js'
import protect from '../middleware/auth.middleware.js'
import optionalAuth from '../middleware/optionalAuth.middleware.js'
import { adminProtectedRoute } from '../middleware/admin.middleware.js'
import {
    createNewOrderController,
    getMyOrdersController,
    getMyOrderController,
    getAllOrderController,
    getOrderByIdController,
    updateOrderStatusController,
    cancelMyOrderController,
    adminCancelOrderController,
    deleteOrderController,
} from '../controller/order.controller.js'

const orderRoute = express.Router()

// Customers (guest checkout allowed — orders link to the account when signed in)
orderRoute.post('/orders', optionalAuth, validate(createOrderSchema), createNewOrderController)
orderRoute.get('/orders/mine', protect, getMyOrdersController)
orderRoute.get('/orders/mine/:orderId', protect, getMyOrderController)
orderRoute.patch('/orders/mine/:orderId/cancel', protect, cancelMyOrderController)

// Admin
orderRoute.get('/orders', protect, adminProtectedRoute, getAllOrderController)
orderRoute.get('/orders/:orderId', protect, adminProtectedRoute, getOrderByIdController)
orderRoute.patch('/orders/:orderId/status', protect, adminProtectedRoute, validate(updateOrderStatusSchema), updateOrderStatusController)
orderRoute.delete('/orders/:orderId/cancel', protect, adminProtectedRoute, adminCancelOrderController)
orderRoute.delete('/orders/:orderId', protect, adminProtectedRoute, deleteOrderController)

export default orderRoute
