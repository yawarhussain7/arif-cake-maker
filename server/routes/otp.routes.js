import express from 'express'
import validateUserSchema from '../middleware/validate.middleware.js'
import { sendOtpSchema, verifyOtpSchema } from '../validator/otp.validator.js'
import { sendOtpController, verifyOtpController } from '../controller/otp.controller.js'
import { otpLimiter } from '../middleware/ratelimiter.middleware.js'

const route = express.Router()

route.post(
    '/send-otp',
    otpLimiter,
    validateUserSchema(sendOtpSchema),
    sendOtpController
)

route.post(
    '/verify-otp',
    validateUserSchema(verifyOtpSchema),
    verifyOtpController
)

export default route