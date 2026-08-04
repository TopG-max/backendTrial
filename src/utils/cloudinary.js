import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if( !localFilePath ) return null 
        // Upload file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type : "auto"
        })    
        //file has been uploaded sucessfully
        console.log("Has been uploaded on cloudinary !",response.url);
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)  //Removes the locally saved temporary file in local server as the upload operation is failed
        return null
    }
}

export { uploadOnCloudinary }