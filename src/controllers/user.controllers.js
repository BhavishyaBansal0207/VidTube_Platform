import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import console from "console";

const registerUser = asyncHandler(async (req, res) => {
    const {fullname, username, email, password} = req.body

    // if(fullname.trim() === ""){
    //     throw new ApiError(400, "All fieds are required")
    // }
    
    // This is the standrd way to check all the fields that we are getting from the req body  
    if([fullname, username, email, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}] 
    })

    if(existedUser){
        throw new ApiError(409, "User email or username already exists");
    }

    console.warn(req.files)
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverLocalPath = req.files?.coverImage?.[0]?.path

    console.log("Avatar local path : ",avatarLocalPath);
    
    if(!avatarLocalPath){
        throw new ApiError(409, "Avatar file is missing")
    }

    // we are storing only the url of the avatar and then we are uploading onto the cloudinary 

    // const avatar = await uploadOnCloudinary(avatarLocalPath)
    // when we are uploading it on cloudinary we are getting an complex object 

    // let coverImage = ""
    // if(coverLocalPath){
    //     coverImage = await uploadOnCloudinary(coverLocalPath)
    // }

    // optimizing uploading part 
    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)
        console.log("Uploaded avatar ", avatar); 
    } catch (error) {
        console.error("Detailed avatar error : ",error);
        
        console.log("Error in uploading Avatar");
        throw new ApiError(500, "Failed to upload avatar")
    } 

    let coverImage;
   if (coverLocalPath) {
     try {
         coverImage = await uploadOnCloudinary(coverLocalPath)
         console.log("Uploaded coverImage ", coverImage);
         
     } catch (error) {
         console.log("Error in uploading coverImage", error);
         throw new ApiError(500, "Failed to upload coverImage");
     }
   }

    try {
        const user = await User.create({
            fullname,
            avatar: avatar?.secure_url,
            coverImage: coverImage?.secure_url || "",
            username: username.toLowerCase(),
            password,
            email
        })
    
        const createdUser = await User.findById(user._id).select("-password -refreshToken")
        if(!createdUser){
            throw new ApiError(500, "Something went wrong while registering a user")
        }
    
        return res
            .status(201)
            .json(new ApiResponse(201, createdUser, "User registered successfully"));

    } catch (error) {
        console.log("User creation failed!!");
        
        if(avatar){
            await deleteFromCloudinary(avatar.public_id)
        }
        if(coverImage){
            await deleteFromCloudinary(coverImage.public_id)
        }

        throw new ApiError(500, `Something went wrong while registering a user and uploaded images are also deleted : ${error}`)
    }
})

export {registerUser}