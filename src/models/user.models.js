import mongoose, { Schema } from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
/*
    id string
    username
    email
    fullName
    avatar
    coverImage
    watchHistory ObjectId[] Videos
    password
    refreshToken
    createdAt
    updatedAt
*/


const userSchema = new Schema(
    {
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        inndex: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        trim: true,
        index: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
    },
    watchHistory: [
        {
        type: Schema.Types.ObjectId,
        ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, "password is required!!"]
    },
    refreshToken: {
        type: String
    }
},
{
    timestamps: true
}
); 

userSchema.pre("save", async function(next){
    // ismodified Corrected to isModified while 'registerUser' 
    if(!this.isModified("password")) return next()
    this.password = bcrypt.hash(this.password, 10)
    next

    // there was a problem when we had writen next() as a function but we have to write just next and it was fixed while testing for register user controller
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return json.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", userSchema)