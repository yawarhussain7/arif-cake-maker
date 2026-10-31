import express from 'express'
import validateUserSchema from '../middleware/validate.middleware.js'
import {loginUserSchema,registerUserSchema} from '../validator/user.validator.js'
import {registerController,loginController,logoutController,meController} from '../controller/user.controller.js'
import protect from '../middleware/auth.middleware.js'
import {loginLimiter} from '../middleware/ratelimiter.middleware.js'
const route = express.Router()

route.post('/register',validateUserSchema(registerUserSchema),registerController)
route.post('/login',validateUserSchema(loginLimiter,loginUserSchema),loginController)
route.post('/logout',logoutController)
route.get('/me',protect,meController)


export default route