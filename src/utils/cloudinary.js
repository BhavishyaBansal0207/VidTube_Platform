import {v2 as cloudinary } from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"

dotenv.config();
    // confiure cloudinary
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
        api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
    });

const uploadOnCloudinary = async (localFilePath) => {
    try {
        console.log("Cloudinary Config : ", {
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
          api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
        });
        
        if(!localFilePath) return null
        
        const normalizedPath = localFilePath.replace(/\\/g, "/");

        const response = await cloudinary.uploader.upload(normalizedPath, {
          resource_type: "auto",
        });

        if(fs.existsSync(localFilePath)){
            fs.unlinkSync(localFilePath)
        }

        return response

    } catch (error) {
        console.log("Error in cloudinary ", error);
        fs.unlinkSync(localFilePath)
        throw error
    }
}

const deleteFromCloudinary = async(publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Deleted from cloudinary ", publicId);
        
    } catch (error) {
        console.log("Error while deleting from cloudinary", error);
        return null;
        
    }
}    
export {uploadOnCloudinary, deleteFromCloudinary}