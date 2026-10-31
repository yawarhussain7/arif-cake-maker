import { createNotification, getNotification, getUnreadCount, marksAsRead, markAllAsRead, deleteNotification } from '../services/notification.service.js'
import AppErrors from '../utils/AppError.js'
import { sendresponse } from '../utils/response.js'

// A malformed id reaches Mongoose as a CastError — surface it as a 400.
const toAppError = (error) => (error?.name === 'CastError' ? new AppErrors('Invalid notification ID', 400) : error)

const emptyBody = (body) => !body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length === 0

export const getMyNotificationsController = async (req, res, next) => {
    try {
        const notifications = await getNotification(req.user.id)
        return sendresponse(req, res, 200, true, 'notifications found', notifications)
    } catch (error) {
        next(toAppError(error))
    }
}

// GET /notifications/unread-count — drives the bell badge.
export const getUnreadCountController = async (req, res, next) => {
    try {
        const count = await getUnreadCount(req.user.id)
        return sendresponse(req, res, 200, true, 'unread count found', { count })
    } catch (error) {
        next(toAppError(error))
    }
}

// POST /notifications (admin) — hand a notification to a user; `userId` is
// optional and falls back to the admin creating it.
export const createNotificationController = async (req, res, next) => {
    if (emptyBody(req.body)) {
        return sendresponse(req, res, 400, false, 'request is empty')
    }

    try {
        const { userId, ...data } = req.body
        const notification = await createNotification(userId || req.user.id, data)
        return sendresponse(req, res, 201, true, 'notification created successfully', notification)
    } catch (error) {
        next(toAppError(error))
    }
}

// PATCH /notifications/:id/read
export const marksAsReadController = async (req, res, next) => {
    try {
        const notification = await marksAsRead(req.params.id, req.user.id)
        if (!notification) {
            throw new AppErrors('Notification not found', 404)
        }
        return sendresponse(req, res, 200, true, 'notification marked as read', notification)
    } catch (error) {
        next(toAppError(error))
    }
}

// PATCH /notifications/read-all — clears the inbox (reading dismisses).
export const markAllAsReadController = async (req, res, next) => {
    try {
        const result = await markAllAsRead(req.user.id)
        return sendresponse(req, res, 200, true, 'all notifications marked as read', {
            deletedCount: result?.deletedCount ?? 0,
        })
    } catch (error) {
        next(toAppError(error))
    }
}

// DELETE /notifications/:id
export const deleteNotificationController = async (req, res, next) => {
    try {
        const notification = await deleteNotification(req.params.id, req.user.id)
        if (!notification) {
            throw new AppErrors('Notification not found', 404)
        }
        return sendresponse(req, res, 200, true, 'notification deleted successfully', notification)
    } catch (error) {
        next(toAppError(error))
    }
}
