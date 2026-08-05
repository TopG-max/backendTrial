import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"  
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req,res) => {
    // Get user details from frontend
    // Validation (sent data should'nt be empty)
    // Check if user alr exists : check if username , email unique
    // Check for images , check for avatar 
    // Upload them to cloudinary , avatar
    // Create user object - create entry in DB
    // Remove password and refreshToken field from response
    // Check for user creation 
    // return response

    //Taking input from user in frontend , use req.body
    const{ fullName , email, userName, password } = req.body
    console.log( "email : " , email);   

    //Validating
    if(
        [fullName,email,userName,password].some((field)=>field?.trim() === "") // returns callback if any one of the element in array returns TRUE for condition
    ){
        throw new ApiError(400,"All fields are required")
    }

    //Checking if user alr exists
    const existedUser = User.findOne({ // finds one document
        $or : [{ username } , { email }] //$or is used to check either username or email
    })

    if(existedUser){
        throw new ApiError(409,"User with username/email alr exists")
    }

    //Checking for images and making sure avatar is compulsary
    const avatarLocalPath =  req.files?.avatar[0]?.path  // returns the local path of the avatar image 
    const coverImageLocalPath =  req.files?.coverImage[0]?.path


    //avatar made comppulsary
    if ( !avatarLocalPath ){
        throw new ApiError(400 , "Avatar Image is required")
    }

    //Upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const converImage = await uploadOnCloudinary(converImageLocalPath)
    
    //check again if avatar exists
    if ( !avatar ){
        throw new ApiError(400 , "Avatar Image is required")
    }

    //create entry in DB
    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",  //checks if coverImage exists . If does return url if not return empty
        email,
        password,
        username : username.toLowerCase()
    })

    //returning everything except password and refreshToken
    const createdUser = await User.findById(user._id).select(  //select here selects all the elements entered by user except the ones mentioned below
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    //Returning api response using ApiResponse
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )


})


export { registerUser }