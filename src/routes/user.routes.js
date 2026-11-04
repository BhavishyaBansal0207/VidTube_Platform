import { Router } from "express";
import { 
    changeCurrentPassword, 
    getCurrentUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateAccountDetails, 
    updateCoverImage, 
    updateUserAvatar } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(upload.fields(
    [
        {
            name : 'avatar',
            maxCount: 1
        },
        {
            name : 'coverImage',
            maxCount: 1 
        }
    ]), 
    registerUser
);

router.route("/login").post(loginUser)

router.route("/getUser").get(verifyJWT, getCurrentUser)

router.route("/changePassword").post(verifyJWT, changeCurrentPassword)

router.route("/refreshAccessToken").post(verifyJWT, refreshAccessToken)

router.route("/logout").post(logoutUser)

router.route("/updateDetails").post(verifyJWT, updateAccountDetails)

router.route("/updateAvatar").post(verifyJWT ,upload.single('avatar'), updateUserAvatar)

router.route("/updateCover").post(verifyJWT, upload.single('coverImage'), updateCoverImage)

export default router