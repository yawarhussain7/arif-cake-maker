import User from '../models/user.models.js'
import { generateOtp, hashOtp, otpExpiry } from '../utils/authHelpers.js'
import { sendVerificationEmail } from './email.service.js'
import AppError from '../utils/AppError.js'

const MAX_OTP_ATTEMPTS = 3

export const sendOtp = async ({ email }) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new AppError('User not found with this email address', 404)
    }

    if (user.emailVerified) {
        throw new AppError('Email is already verified.', 400)
    }

    const otp = generateOtp()
    const otpHashValue = hashOtp(otp)

    user.otpHash = otpHashValue
    user.otpExpiresAt = otpExpiry()
    user.otpSentAt = new Date()
    user.otpAttempts = 0

    await user.save()

    await sendVerificationEmail({
        to: user.email,
        name: user.username,
        otp,
    })

    return { success: true, message: 'OTP sent successfully to your email' }
}

export const verifyOtp = async ({ email, otp }) => {
    const user = await User.findOne({ email })
        .select('+otpHash +otpExpiresAt +otpAttempts +otpSentAt')

    if (!user) {
        throw new AppError('User not found with this email address', 404)
    }

    if (!user.otpHash || !user.otpExpiresAt) {
        throw new AppError('No OTP found. Please request a new OTP.', 400)
    }

    if (user.otpExpiresAt < new Date()) {
        throw new AppError('OTP has expired. Please request a new OTP.', 400)
    }

    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
        throw new AppError(
            'Too many failed attempts. Please request a new OTP.',
            400
        )
    }

    const hashedOtp = hashOtp(otp)

    if (hashedOtp !== user.otpHash) {
        user.otpAttempts += 1
        await user.save()
        throw new AppError('Invalid OTP. Please try again.', 400)
    }

    user.emailVerified = true
    user.otpHash = null
    user.otpExpiresAt = null
    user.otpAttempts = 0
    user.otpSentAt = null

    await user.save()

    return { success: true, message: 'Email verified successfully' }
}