import User from '../models/user.models.js'
import bcrypt from 'bcrypt'
import AppError from "../utils/AppError.js";

export const registerUser = async ({ username, email, role, password }) => {

    const existUser = await User.findOne({ email })

    if (existUser) {
        throw new AppError("An account with this email already exists", 409)
    }

    const hashPass = await bcrypt.hash(password, 10)

    try {
        // awaited so the duplicate-key catch below actually runs
        return await User.create({
            username,
            email,
            role: 'customer',
            password: hashPass
        })
    } catch (error) {
      
            throw new AppError(
                "An account with this email already exists",
                409
            );
        }
       
    }

export const LoginUser = async ({ email, password }) => {

    const user = await User.findOne({ email }).select("+password")
    if (!user) {
        throw new AppError('Invalid email or password', 401)
    }

    const authenticate = await bcrypt.compare(password, user.password)
    if (!authenticate) {
        throw new AppError('Invalid email or password', 401)
    }

    return user
}
