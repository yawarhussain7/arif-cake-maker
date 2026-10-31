import {createHash,randomInt} from 'crypto'

export const hashOtp = (otp)=>{
    return createHash("sha256").update(otp).digest('hex')
}

export const generateOtp = ()=>{
    randomInt(0,1_000_000).toString().padStart(6,'0')
}

export const validEmail = (email) =>
  typeof email === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
  email.length <= 254;

export const otpExpiry = () =>
  new Date(Date.now() + 15 * 60 * 1000);