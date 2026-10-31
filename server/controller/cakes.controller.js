import { createCakes, updateCakes, DeleteCake, SingleCake,getAllcakes } from '../services/cakes.service.js'
import { sendresponse } from '../utils/response.js'

// Multer stores the uploaded file on disk; expose it to the service as a URL.
const attachPhoto = (req) => {
    if (req.file) {
        req.body.photo = `/uploads/cakes/${req.file.filename}`
    }
}

export const createCakesController = async (req, res, next) => {
    attachPhoto(req)
    if (!req.body ||typeof req.body !== 'object' ||Array.isArray(req.body) ||Object.keys(req.body).length === 0) {
        return sendresponse(req, res, 400, false, 'request is empty')
    }

    if (!req.body.photo) {
        return sendresponse(req, res, 400, false, 'cake photo is required')
    }

    try {
        const cake = await createCakes(req.body)
        return sendresponse(req, res, 201, true, 'cake create successfully', cake)
    } catch (error) {
        next(error)
    }
}

export const updateCakeController = async(req,res,next)=>{
     attachPhoto(req)
     if (!req.body ||typeof req.body !== 'object' ||Array.isArray(req.body) ||Object.keys(req.body).length === 0) {
        return sendresponse(req, res, 400, false, 'request is empty')
    }
     const cakeId = req.params.id

     try {
        const cake = await updateCakes(cakeId,req.body)
        return sendresponse(req, res, 200, true, 'cake update successfully', cake)
    } catch (error) {
        next(error)
    }

}
export const SingleCakeController = async(req,res,next)=>{
    
    const cakeId = req.params.id
     try {
        const cake = await SingleCake(cakeId)
        return sendresponse(req, res, 200, true, 'cake found successfully', cake)
    } catch (error) {
        next(error)
    }

}

export const getAllCakesController = async(req,res,next)=>{
    const {category}=req.query
    try{
        const cakes = await getAllcakes(category)
        return sendresponse(req,res,200,true,'cakes found successfully',cakes)
    }catch(error){
        next(error)
    }
}

export const deleteCakeController = async(req,res,next)=>{
    
    const cakeId = req.params.id
     try {
        const cake = await DeleteCake(cakeId)
        return sendresponse(req, res, 200, true, 'cake delete successfully', cake)
    } catch (error) {
        next(error)
    }

}
