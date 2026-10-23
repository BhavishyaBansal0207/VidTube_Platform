import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import console from "console";
import jwt from "jsonwebtoken"

// whenever we want to add functionality this is our flow --> write controller, then go to routes and add route for this controller along with the middlewares and then go to app.js and import this route and pass the control to the controller 

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        if(!user){
            throw new ApiError(400, "User does not exist");
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false});
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, `Something went wrong while generating access and refresh token : ${error}`)
    }
}

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

    // console.log("Avatar local path : ",avatarLocalPath);
    
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

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // validate user
  if (!email || !password) {
    throw new ApiError(500, "Email and password is required");
  }

  console.log("Email : ", email);
  console.log("Password : ", password);
  
  const user = User.findOne({
    $or: [{ email }, { password }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // check the password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } =
    await user.generateAccessAndRefreshToken(user._id);

  // now we have two options either use the existed user object or use a new object after adding refresh token

  /**
   * this is how the user document looks when we have not added the refresh token
    {
        _id: ObjectId('6ad8fde1dbd2c911f0f0bae4'),
        username: 'bb_18',
        email: 'bhavishya@gmail.com',
        avatar: 'https://res.cloudinary.com/os54pwgz/image/upload/v1792605658/hu0gihjn9gmtmsyvy4x4.png',
        coverImage: 'https://res.cloudinary.com/os54pwgz/image/upload/v1792605665/b8bzjzrajwhu2frdzxnx.png',
        watchHistory: [],
        password: '888891',
        createdAt: ISODate('2026-10-21T18:01:05.151Z'),
        updatedAt: ISODate('2026-10-21T18:01:05.151Z'),
        __v: NumberInt('0')
    }
     */

  const loggedInUser = await User.findById(user._id).select("-password -refreshtoken")
  if(!loggedInUser){
    throw new ApiError(401, "User is not logged in ")
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" 
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
        200, 
        { user : loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
    ))
}) 

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Refresh token is required")
    }
    
    // now decode the token to check if the incoming token is correct or not 
    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken?._id);
    if(!user){
        throw new ApiError(401, "Invalid refresh token");
    }

    // since we have stored the refresh token in user document and this token cntains user id so with the help of this decoded token we will compare the incoming token with token stored in database
    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh token is expired")
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshToken(user._id)

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(
            200, 
            {
                accessToken,
                refreshToken: newRefreshToken
            },
            "Access token refreshed successfully"
        ))

})

export {
    registerUser,
    loginUser,
    refreshAccessToken
}