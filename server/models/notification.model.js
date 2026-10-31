import mongoose from 'mongoose'


const notificationSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:[true,'user is required'],
        index:true
    },
    title:{
        type:String,
        required:true,
        trim:true,
        minlength:[3,'title must be more the 3 characters'],
        maxlength:[150,'title must be less then 150 characters']
    },
    message:{
        type:String,
        trim:true,
        maxlength:1000,
        required:true
    },
    type: {
      type: String,
      enum: [
        "info",
        "success",
        "warning",
        "error",
        "order",
        "payment",
        "system",
      ],
      default: "info",
    },
    isRead:{
        type:Boolean,
        default:false
    },
    readAt: {
      type: Date,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
},{
    timestamps:true
})
notificationSchema.index({ user: 1, createdAt: -1 });

const NotificationModel = mongoose.model('Notifications',notificationSchema)

export default NotificationModel