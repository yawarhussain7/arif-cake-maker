import User from '../models/user.models.js'
import OrderModel from '../models/order.model.js'
import Cake from '../models/cakes.model.js'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import AppErrors from '../utils/AppError.js'

const ALLOWED_ROLES = ['customer', 'admin']

export const getUserService = async (role) => {
    if (!role) {
        throw new AppErrors('user role not found', 400)
    }
    if (!ALLOWED_ROLES.includes(role)) {
        throw new AppErrors('Invalid role. Allowed roles: ' + ALLOWED_ROLES.join(', '), 400)
    }
    return User.find({ role }).sort({ createdAt: -1 })
}

export const deleteUser = async (userId, actingAdminId = null) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new AppErrors('Invalid customer ID', 400)
    }

    if (actingAdminId && String(userId) === String(actingAdminId)) {
        throw new AppErrors('You cannot delete your own account', 400)
    }

    const user = await User.findById(userId)

    if (!user) {
        throw new AppErrors('Customer not found', 404)
    }

    if (user.role === 'admin') {
        throw new AppErrors('Admin accounts cannot be deleted from here', 400)
    }

    await user.deleteOne()

    return user
}


export const AdminProfile = async ({ userId, username, email, phone }) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new AppErrors('Invalid user ID', 400)
    }

    try {
        const user = await User.findByIdAndUpdate(
            { _id: userId },
            {
                ...(username !== undefined && { username }),
                ...(email !== undefined && { email }),
                ...(phone !== undefined && { phone }),
            },
            {
                new: true,
                runValidators: true,
            }
        )

        if (!user) {
            throw new AppErrors('User not found', 404)
        }

        return user
    } catch (error) {
        if (error?.code === 11000) {
            throw new AppErrors('An account with this email already exists', 409)
        }
        throw error
    }
}

export const getTotalOrder = async () => {
    return await OrderModel.countDocuments()
}

// Password used when the admin doesn't type one (there is no invite/reset flow
// yet, so the admin shares it with the customer).
export const DEFAULT_CUSTOMER_PASSWORD = 'Customer@1234'

// Create a customer account from the admin console. The account is a normal
// User, so it shows up in GET /admin/customers and can sign in immediately.
export const createCustomer = async ({ username, email, phone = '', city = '', password = DEFAULT_CUSTOMER_PASSWORD }) => {
    const name = String(username ?? '').trim()

    if (name.length < 3) {
        throw new AppErrors('Username must be at least 3 characters', 400)
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? '').trim())) {
        throw new AppErrors('Please provide a valid email', 400)
    }
    if (String(password).length < 8) {
        throw new AppErrors('Password must be at least 8 characters', 400)
    }

    const exist = await User.findOne({ email: String(email).trim().toLowerCase() })
    if (exist) {
        throw new AppErrors('An account with this email already exists', 409)
    }

    try {
        return await User.create({
            username: name,
            email: String(email).trim(),
            phone,
            city,
            password: await bcrypt.hash(String(password), 10),
            role: 'customer',
            isActive: true,
        })
    } catch (error) {
        if (error?.code === 11000) {
            throw new AppErrors('An account with this email already exists', 409)
        }
        throw error
    }
}

// Edit a customer from the admin console (never their password).
export const updateCustomer = async ({ userId, username, email, phone, city }) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new AppErrors('Invalid customer ID', 400)
    }

    const existing = await User.findById(userId)

    if (!existing) {
        throw new AppErrors('Customer not found', 404)
    }

    if (existing.role === 'admin') {
        throw new AppErrors('Admin accounts are edited through the profile settings', 400)
    }

    try {
        return await User.findByIdAndUpdate(
            { _id: userId },
            {
                ...(username !== undefined && { username }),
                ...(email !== undefined && { email }),
                ...(phone !== undefined && { phone }),
                ...(city !== undefined && { city }),
            },
            { new: true, runValidators: true }
        )
    } catch (error) {
        if (error?.code === 11000) {
            throw new AppErrors('An account with this email already exists', 409)
        }
        throw error
    }
}

export const getTotalCakesInStock = async () => {
    const result = await Cake.aggregate([
        {
            $group: {
                _id: null,
                totalStock: { $sum: "$stock" }
            }
        }
    ])

    return result[0]?.totalStock ?? 0
}

export const getTotalRevenu = async () => {
    const result = await OrderModel.aggregate([
        {
            $match: { status: { $ne: "Cancelled" } }
        },
        {
            $group: {
                _id: null,
                totalRevenu: { $sum: "$totalAmount" }
            }
        }
    ])

    return result[0]?.totalRevenu ?? 0
}

export const getTotalCustomers = async () => {
    return await User.countDocuments({ role: 'customer' })
}

// Everything the dashboard's stat cards need, in one round trip.
export const getStats = async () => {
    const [totalOrders, revenue, stock, customers] = await Promise.all([
        getTotalOrder(),
        getTotalRevenu(),
        getTotalCakesInStock(),
        getTotalCustomers(),
    ])

    return { totalOrders, revenue, stock, customers }
}