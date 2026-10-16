import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
    const {fullName, username, email, password} = req.body

    // if(fullName.trim() === ""){
    //     throw new ApiError(400, "All fieds are required")
    // }
    
    // This is the standrd way to check all the fields that we are getting from the req body  
    if([fullName, username, email, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = User.findOne({
        $or: [{username}, {email}] 
    })

    if(existedUser){
        throw new ApiError(409, "User email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0].path
    const coverLocalPath = req.files?.coverImage[0].path

    if(!avatarLocalPath){
        throw new ApiError(409, "Avatar file is missing")
    }

    // we are storing only the url of the avatar and then we are uploading onto the cloudinary 

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    // when we are uploading it on cloudinary we are getting an complex object 

    let coverImage = ""
    if(coverLocalPath){
        coverImage = await uploadOnCloudinary(coverLocalPath)
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        password,
        email
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering a user")
    }

    return res
        .status(2500)
        .json(new ApiResponse(200, createdUser, "User registered successfully"));
})

export {registerUser}