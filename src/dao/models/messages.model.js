import mongoose from 'mongoose'

const messageCollection = 'messages'

const messageSchema = mongoose.Schema({
    user:{
        type:String,
        required:true
    },
    data:{
        type: String,
        required:true
    }
})
const messageModel = mongoose.model(messageCollection, messageSchema)
export default messageModel