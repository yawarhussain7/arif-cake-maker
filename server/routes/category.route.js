import express from 'express'
import validate from '../middleware/validate.middleware.js'
import { createCategorySchema, updateCategorySchema } from '../validator/categories.validator.js'
import {
    getAllCategoriesController,
    createCategoryController,
    updateCategoryController,
    deleteCategoryController,
} from '../controller/category.controller.js'
import protect from '../middleware/auth.middleware.js'
import { adminProtectedRoute } from '../middleware/admin.middleware.js'

const categoryRoute = express.Router()

// Browsing categories is public…
categoryRoute.get('/categories', getAllCategoriesController)

// …but managing them is admin-only.
categoryRoute.post('/categories/new', protect, adminProtectedRoute, validate(createCategorySchema), createCategoryController)
categoryRoute.put('/categories/:id/edit', protect, adminProtectedRoute, validate(updateCategorySchema), updateCategoryController)
categoryRoute.delete('/categories/:id', protect, adminProtectedRoute, deleteCategoryController)

export default categoryRoute