import cakesModel from '../models/cakes.model.js'
import AppErrors from '../utils/AppError.js'

export const createCakes = async(cakeData)=>{
    const {cakename,category,flavor,price,stock,description,style,photo,isAvailable} = cakeData
    const cakes = await cakesModel.create({
        name:cakename,
        category:category,
        flavor:flavor,
        price,
        stock,
        description,
        style,
        photo,
        isAvailable
    })

    if(!cakes){
        throw new AppErrors('Cake no upload ',400)
    }

    return cakes
}

export const updateCakes = async(cakeId,updateData)=>{
    const {cakename,category,flavor,price,stock,description,style,photo,isAvailable} = updateData
    
    const updateCake = await cakesModel.findByIdAndUpdate(
        cakeId,
        {
             ...(cakename !== undefined && { name: cakename }),
            ...(category !== undefined && { category }),
            ...(flavor !== undefined && { flavor }),
            ...(price !== undefined && { price }),
            ...(stock !== undefined && { stock }),
            ...(description !== undefined && { description }),
            ...(style !== undefined && { style }),
            ...(photo !== undefined && { photo }),
            ...(isAvailable !== undefined && { isAvailable })
        },{
            new: true,
            runValidators: true
        }
    )

    if(!updateCake){
        throw new AppErrors('Cake not found',404)
    }

return updateCake;

}

export const DeleteCake = async(cakeId)=>{
    const del = await cakesModel.findByIdAndDelete(cakeId)
    if(!del){
        throw new AppErrors('Cake not found',404)
    }

    return del
}

export const SingleCake = async(cakeId)=>{
    const cake = await cakesModel.findById(cakeId)
    if(!cake){
        throw new AppErrors('cake not found',404)
    }

    return cake
}

export const getAllcakes = async(category)=>{
    const filter = {}

    if(category && category !== 'All'){
        filter.category = category
    }
    return await cakesModel.find(filter).sort({createdAt:-1})
}

export const totalCakes = async()=>{
    return await cakesModel.countDocuments()
}