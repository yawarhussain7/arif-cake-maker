import multer from 'multer'
import fs from 'fs'
import path from 'path'


const uploadDir = path.join(process.cwd(), 'uploads', 'cakes')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },

    filename: (req, file, cb) => {
        const uniquename = Date.now() + "-" +Math.round(Math.random() * 1e9) +path.extname(file.originalname).toLowerCase()

        cb(null,uniquename)
    }
})

const fileFilter = (req,file,cb)=>{
    const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  ];

  if(allowedTypes.includes(file.mimetype)){
    return cb(null,true)
  }

 cb(new Error("Only JPG and PNG images are allowed"), false);
}

const upload = multer({
    storage,
    fileFilter,
     limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
})

export default upload