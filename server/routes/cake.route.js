import express from 'express'
import upload from '../middleware/cakeImage.middleware.js'
import validateCakeSchema from '../middleware/validate.middleware.js'
import { createCakeSchema, updateCakeSchema } from '../validator/cakes.validator.js'
import {createCakesController,updateCakeController,SingleCakeController,deleteCakeController,getAllCakesController} from '../controller/cakes.controller.js'
import protect from '../middleware/auth.middleware.js'
import { adminProtectedRoute } from '../middleware/admin.middleware.js'

const cakeroute = express.Router()

// Browsing the catalogue is public…
cakeroute.get('/cakes',getAllCakesController)
cakeroute.get('/cake/:id',SingleCakeController)

// …but managing it is admin-only.
cakeroute.post('/cakes/new',protect,adminProtectedRoute,upload.single('photo'),validateCakeSchema(createCakeSchema),createCakesController)
cakeroute.put('/cakes/:id/edit',protect,adminProtectedRoute,upload.single('photo'),validateCakeSchema(updateCakeSchema),updateCakeController)
cakeroute.delete('/cake/:id',protect,adminProtectedRoute,deleteCakeController)

export default cakeroute