import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData:{type:Object,default:{}},
    listedGoods : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'food'
        }
    ]
}, { minimize: false })

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.password
    }
})

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;