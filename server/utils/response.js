export const sendresponse = (req,res,statusCode,success,message,data=null)=>{
    
    return res.status(statusCode).json({
        message,
        success,
        data:data
    })
}

