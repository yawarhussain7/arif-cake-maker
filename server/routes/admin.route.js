
import {getAllUser,DeleteUserController,AdminProfileController,getStatsController} from '../controller/admin.controller.js'
import {adminLoginController} from '../controller/user.controller.js'
import {adminProtectedRoute} from '../middleware/admin.middleware.js'
import protect from '../middleware/auth.middleware.js'
import express from 'express'

const Adminroute = express.Router()

Adminroute.post('/login', adminLoginController)
Adminroute.get('/customers',protect,adminProtectedRoute,getAllUser)
Adminroute.delete('/customers/:id',protect,adminProtectedRoute,DeleteUserController)
Adminroute.patch('/profile',protect,adminProtectedRoute,AdminProfileController)
Adminroute.get('/stats',protect,adminProtectedRoute,getStatsController)


export default Adminroute