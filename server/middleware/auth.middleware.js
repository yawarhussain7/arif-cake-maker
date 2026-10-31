import jwt from 'jsonwebtoken'
import User from '../models/user.models.js'
import AppError from '../utils/AppError.js'

// Verifies the httpOnly `token` cookie and attaches the user to req.user.
const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token
        if (!token) {
            throw new AppError('Not authenticated', 401)
        }

        let decoded
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
        } catch {
            throw new AppError('Not authenticated', 401)
        }

        const user = await User.findById(decoded.id)
        if (!user || !user.isActive) {
            throw new AppError('Not authenticated', 401)
        }

        req.user = user
        next()
    } catch (error) {
        next(error)
    }
}

export default protect
