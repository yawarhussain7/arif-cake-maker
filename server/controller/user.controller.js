import {registerUser,LoginUser} from '../services/user.service.js'
import { sendOtp } from '../services/otp.service.js'
import generateToken from '../utils/generateToken.js'
import CookiesOptions from '../utils/cookiesOptions.js'
import AppError from '../utils/AppError.js';

const sendAuthResponse=async(res,statusCode,user,message)=>{
    const token = await generateToken(user)

    res.cookie('token',token,CookiesOptions())

    return res.status(statusCode).json({
        success:true,
        message:message,
        data:{
            user:{
                id:user._id,
                username:user.username,
                email:user.email,
                role:user.role
            }
        }
    })
}

export const registerController = async(req,res,next)=>{
    try{
        const {username,email,role,password}=req.body
        const user = await registerUser({username,email,role,password})
        // Send OTP for email verification — non-fatal if email service is down
        try {
            await sendOtp({ email })
            return res.status(201).json({
                success: true,
                message: 'Account created successfully. A verification code has been sent to your email. It expires in 15 minutes.',
                requiresVerification: true,
                email
            })
        } catch (otpErr) {
            // OTP sending failed but account was created — still return success
            return res.status(201).json({
                success: true,
                message: 'Account created successfully. Could not send verification email — please request a new code.',
                requiresVerification: true,
                email,
                otpError: otpErr.message
            })
        }
    }catch(error){
        next(error)
    }
}

export const loginController = async(req,res,next)=>{
    try{
        const {email,password}=req.body
        const user = await LoginUser({email,password})
        if (user.role === 'admin') {
            throw new AppError('Please use the admin login portal.', 403)
        }
        return await sendAuthResponse(res,200,user,'Login successfully')
    }catch(error){
        next(error)
    }
}

export const adminLoginController = async(req,res,next)=>{
    try{
        const {email,password}=req.body
        const user = await LoginUser({email,password})
        if (user.role !== 'admin') {
            throw new AppError('Access denied. Admins only.', 403)
        }
        return await sendAuthResponse(res,200,user,'Admin login successfully')
    }catch(error){
        next(error)
    }
}

export const logoutController = async(req,res)=>{
    res.clearCookie("token",{
        httpOnly:CookiesOptions().httpOnly,
        secure:CookiesOptions().secure,
        sameSite:CookiesOptions().sameSite,
        path:CookiesOptions().path
    })

    return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}

// GET /auth/me — the protect middleware already loaded the user onto req.user.
export const meController = async(req,res)=>{
    return res.status(200).json({
        success:true,
        message:'User fetched successfully',
        data:{
            user:{
                id:req.user.id,
                username:req.user.username,
                email:req.user.email,
                role:req.user.role
            }
        }
    })
}