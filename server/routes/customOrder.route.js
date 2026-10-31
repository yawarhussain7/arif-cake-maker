import express from 'express'
import upload from '../middleware/customOrder.middleware.js'
import {
    createCustomOrderController,
    getAllCustomOrdersController,
    getCustomOrderByIdController,
    updateCustomOrderStatusController,
    cancelCustomOrderController,
} from '../controller/customOrder.controller.js'
import protect from '../middleware/auth.middleware.js'
import { adminProtectedRoute } from '../middleware/admin.middleware.js'

const customOrderRoute = express.Router()

// Public: create a custom cake order (with image upload)
customOrderRoute.post('/custom-orders', upload.single('referenceImage'), createCustomOrderController)
customOrderRoute.get('/custom-orders', protect, adminProtectedRoute, getAllCustomOrdersController)
customOrderRoute.get('/custom-orders/:id', protect, adminProtectedRoute, getCustomOrderByIdController)
customOrderRoute.patch('/custom-orders/:id/status', protect, adminProtectedRoute, updateCustomOrderStatusController)
customOrderRoute.delete('/custom-orders/:id', protect, adminProtectedRoute, cancelCustomOrderController)

export default customOrderRoute
