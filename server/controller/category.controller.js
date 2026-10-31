import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../services/category.service.js'
import { sendresponse } from '../utils/response.js'

// GET /categories — public, the storefront and the admin both read this list.
export const getAllCategoriesController = async (req, res, next) => {
    try {
        const categories = await getAllCategories()
        return sendresponse(req, res, 200, true, 'categories found successfully', categories)
    } catch (error) {
        next(error)
    }
}

export const createCategoryController = async (req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) || Object.keys(req.body).length === 0) {
        return sendresponse(req, res, 400, false, 'request is empty')
    }

    try {
        const category = await createCategory(req.body)
        return sendresponse(req, res, 201, true, 'category created successfully', category)
    } catch (error) {
        next(error)
    }

}
export const updateCategoryController = async (req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) || Object.keys(req.body).length === 0) {
        return sendresponse(req, res, 400, false, 'request is empty')
    }

    try {
        const category = await updateCategory(req.params.id, req.body)
        return sendresponse(req, res, 200, true, 'category updated successfully', category)
    } catch (error) {
        next(error)
    }

}
export const deleteCategoryController = async (req, res, next) => {
    try {
        const category = await deleteCategory(req.params.id)
        return sendresponse(req, res, 200, true, 'category deleted successfully', category)
    } catch (error) {
        next(error)
    }

}
