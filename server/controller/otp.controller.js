import { sendOtp, verifyOtp } from '../services/otp.service.js'

export const sendOtpController = async (req, res, next) => {
    try {
        const { email } = req.body
        const result = await sendOtp({ email })
        return res.status(200).json({
            success: true,
            message: result.message,
        })
    } catch (error) {
        next(error)
    }
}

export const verifyOtpController = async (req, res, next) => {
    try {
        const { email, otp } = req.body
        const result = await verifyOtp({ email, otp })
        return res.status(200).json({
            success: true,
            message: result.message,
        })
    } catch (error) {
        next(error)
    }
}