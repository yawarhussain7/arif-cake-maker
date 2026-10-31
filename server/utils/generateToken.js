import jwt from 'jsonwebtoken'

const generateToken  = async(user)=>{
    return jwt.sign({id:user._id,email:user.email,role:user.role},process.env.JWT_SECRET,{ algorithm: "HS256",expiresIn:'10h'})
}

export default generateToken