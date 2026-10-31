import categoryModel from '../models/category.model.js'
import AppErrors from '../utils/AppError.js'

// The category cards and the dashboard chart expect the standard set to exist,
// so the first request against an empty collection writes the defaults once.
const DEFAULT_CATEGORIES = [
    { name: 'Birthday Cakes', description: 'Celebration cakes for every age, from classic chocolate to bright strawberry.', shareOfOrders: 38, chartColor: '#4b2819' },
    { name: 'Wedding Cakes', description: 'Multi-tier cakes with fresh flowers, fondant and hand-piped detail.', shareOfOrders: 21, chartColor: '#a9663f' },
    { name: 'Anniversary Cakes', description: 'Elegant small-batch cakes made to mark the years.', shareOfOrders: 15, chartColor: '#dfa98a' },
    { name: 'Custom Cakes', description: 'Designed from your idea, photo or theme. Lead time of 3 days.', shareOfOrders: 13, chartColor: '#ecc7c0' },
    { name: 'Other', description: 'Cupcakes, dessert boxes and seasonal specials.', shareOfOrders: 13, chartColor: '#f2e0d0' },
]

// MongoDB's unique index on `name` surfaces as a duplicate-key error.
const isDuplicateName = (error) => error?.code === 11000

export const getAllCategories = async () => {
    const existing = await categoryModel.find().sort({ createdAt: 1, _id: 1 })
    if (existing.length) return existing

    try {
        await categoryModel.create(DEFAULT_CATEGORIES)
    } catch (error) {
        // A parallel first request may have seeded them already — that's fine.
        if (!isDuplicateName(error)) throw error
    }

    return categoryModel.find().sort({ createdAt: 1, _id: 1 })
}

export const getCategoryById = async (categoryId) => {
    const category = await categoryModel.findById(categoryId)
    if (!category) {
        throw new AppErrors('Category not found', 404)
    }

    return category
}

export const createCategory = async (data) => {
    const { name, description, shareOfOrders, chartColor } = data

    try {
        return await categoryModel.create({
            name,
            description,
            shareOfOrders,
            chartColor,
        })
    } catch (error) {
        if (isDuplicateName(error)) {
            throw new AppErrors('A category with this name already exists', 409)
        }
        throw error
    }
}

export const updateCategory = async (categoryId, data) => {
    const { name, description, shareOfOrders, chartColor } = data

    try {
        // Only the supplied fields are written so a partial update never
        // blanks the rest (same pattern as cakes.service).
        const category = await categoryModel.findByIdAndUpdate(
            categoryId,
            {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(shareOfOrders !== undefined && { shareOfOrders }),
                ...(chartColor !== undefined && { chartColor }),
            },
            {
                new: true,
                runValidators: true,
            }
        )

        if (!category) {
            throw new AppErrors('Category not found', 404)
        }

        return category
    } catch (error) {
        if (isDuplicateName(error)) {
            throw new AppErrors('A category with this name already exists', 409)
        }
        if (error?.name === 'CastError') {
            throw new AppErrors('Invalid category ID', 400)
        }
        throw error
    }
}

export const deleteCategory = async (categoryId) => {
    try {
        const category = await categoryModel.findByIdAndDelete(categoryId)

        if (!category) {
            throw new AppErrors('Category not found', 404)
        }

        return category
    } catch (error) {
        if (error?.name === 'CastError') {
            throw new AppErrors('Invalid category ID', 400)
        }
        throw error
    }
}