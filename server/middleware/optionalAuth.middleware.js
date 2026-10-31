import jwt from 'jsonwebtoken'
import User from '../models/user.models.js'

const optionalAuth = async (req, res, next) => {
    const token = req.cookies?.token
    if (!token) return next()

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id)
        if (user && user.isActive) {
            req.user = user
        }
    } catch {
        // Ignore invalid tokens — the request continues as a guest request.
    }

    next()
}

export default optionalAuth
