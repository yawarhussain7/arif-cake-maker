import NotificationModel from '../models/notification.model.js'
import User from '../models/user.models.js'

export const createNotification = async (userId, data) => {
    const { title, message, type = 'info', metadata } = data

    return await NotificationModel.create({
        user: userId,
        title,
        message,
        type,
        metadata,
    })
}

// Fan a system notification out to every active admin. Best-effort: callers
// (checkout, status changes…) must never fail because a notification could not
// be written, so errors are swallowed here.
export const notifyAdmins = async (data) => {
    try {
        const admins = await User.find({ role: 'admin', isActive: true }).select('_id')
        if (!admins.length) return []

        return await NotificationModel.insertMany(
            admins.map(a => ({
                user: a._id,
                title: data.title,
                message: data.message,
                type: data.type || 'info',
                metadata: data.metadata,
            }))
        )
    } catch {
        return []
    }
}

// Newest first for the bell dropdown.
export const getNotification = async (userId) => {
    return await NotificationModel.find({ user: userId }).sort({ createdAt: -1 })
}

export const getUnreadCount = async (userId) => {
    return await NotificationModel.countDocuments({ user: userId, isRead: false })
}

// Every call is scoped by `user` as well, so a notification can only ever be
// read or changed by its owner (returns null when it isn't theirs → 404).
// Reading dismisses it: the inbox only ever holds what is still unread, so the
// marked document is deleted again after the update.
export const marksAsRead = async (notificationId, userId) => {
    const notification = await NotificationModel.findOneAndUpdate(
        {
            _id: notificationId,
            user: userId,
        }, {
            $set: {
                isRead: true,
                readAt: new Date(),
            },
        }, {
            new: true,
        }
    )

    if (notification) {
        await NotificationModel.deleteOne({ _id: notification._id, user: userId })
    }

    return notification
}

// "Mark all read" clears the inbox for good (same dismiss semantics as above).
export const markAllAsRead = async (userId) => {
    const result = await NotificationModel.deleteMany({ user: userId })
    return { deletedCount: result?.deletedCount ?? 0 }
}

export const deleteNotification = async (notificationId, userId) => {
    return await NotificationModel.findOneAndDelete({
        _id: notificationId,
        user: userId,
    })
}