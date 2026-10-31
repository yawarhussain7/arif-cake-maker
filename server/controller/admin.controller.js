import {getUserService,deleteUser,AdminProfile,getStats,createCustomer,updateCustomer,DEFAULT_CUSTOMER_PASSWORD} from '../services/admin.service.js'
import {sendresponse} from '../utils/response.js'

// What the UI is allowed to see — never the password hash.
const toPublicUser = (u) => ({
    _id: u._id,
    username: u.username,
    email: u.email,
    phone: u.phone,
    city: u.city,
    role: u.role,
    createdAt: u.createdAt,
})

export const getAllUser = async(req,res,next)=>{
    try{
      
        const {role='customer'}=req.query
        const users = await getUserService(role)
        return sendresponse(req,res,200,true,'user found ',users)
    }catch(error){
        next(error)
    }
}

export const DeleteUserController = async(req,res,next)=>{
    // The id comes straight from the URL — req.params.id is a string, so it
    // cannot be destructured. The acting admin comes from the session.
    const userId = req.params.id

    try{
        const del = await deleteUser(userId, req.user.id)

        return sendresponse(req,res,200,true,'user delete successfully',{ id: del._id, username: del.username, email: del.email })
    }catch(error){
        next(error)
    }

}

export const AdminProfileController = async(req,res,next)=>{
    // Who to update comes from the session, never from the request body.
    const {username,email,phone}=req.body ?? {}

    if (username === undefined && email === undefined && phone === undefined) {
        return sendresponse(req,res,400,false,'request is empty')
    }

    try{
        const admin = await AdminProfile({ userId: req.user.id, username, email, phone })
        return sendresponse(req,res,200,true,'admin profile update successfully',{
            id: admin._id,
            username: admin.username,
            email: admin.email,
            phone: admin.phone,
            role: admin.role,
        })
    }catch(error){
        next(error)
    }
}
// GET /admin/stats — the dashboard's numbers, aggregated on the server
// ({ totalOrders, revenue, stock, customers }).
export const getStatsController = async(req,res,next)=>{
    try{
        const stats = await getStats()
        return sendresponse(req,res,200,true,'stats fetched successfully',stats)
    }catch(error){
        next(error)
    }
}