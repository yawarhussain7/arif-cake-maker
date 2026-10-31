import express from 'express'
import validate from '../middleware/validate.middleware.js'
import { createNotificationSchema } from '../validator/notifications.validator.js'
import protect from '../middleware/auth.middleware.js'
import { adminProtectedRoute } from '../middleware/admin.middleware.js'
import {
    getMyNotificationsController,
    getUnreadCountController,
    createNotificationController,
    marksAsReadController,
    markAllAsReadController,
    deleteNotificationController,
} from '../controller/notification.controller.js'

const notificationRoute = express.Router()

// Every notification belongs to the signed-in user — the id used for reading,
// marking and deleting always comes from the session.
notificationRoute.get('/notifications', protect, getMyNotificationsController)
notificationRoute.get('/notifications/unread-count', protect, getUnreadCountController)
notificationRoute.patch('/notifications/read-all', protect, markAllAsReadController)
notificationRoute.patch('/notifications/:id/read', protect, marksAsReadController)
notificationRoute.delete('/notifications/:id', protect, deleteNotificationController)

// Creating a notification for somebody else is admin-only (system events call
// the service helper directly, e.g. notifyAdmins on a new order).
notificationRoute.post('/notifications', protect, adminProtectedRoute, validate(createNotificationSchema), createNotificationController)

export default notificationRoute
