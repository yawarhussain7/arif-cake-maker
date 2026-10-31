import rateLimit from "express-rate-limit";


export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    }
})

export const loginLimiter = rateLimit({
    windowMs:15 * 60 * 1000,
    limit: 10,
    standardHeaders:'draft-8',
    legacyHeaders:false,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    }
})

export const otpLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 8,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many OTP requests. Maximum 8 OTPs per minute. Please try again later.",
    }
})