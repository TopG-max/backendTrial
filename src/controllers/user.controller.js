import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"  
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave : false })

        return { accessToken , refreshToken }


    } catch (error) {
        throw new ApiError(500,"Smtg went wrong while generating refresh and access tokens")
    }
}


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
    const{ fullName , email, username, password } = req.body
    console.log( "email : " , email);   
    console.log(req.body)

    //Validating
    if(
        [fullName,email,username,password].some((field)=>field?.trim() === "") // returns callback if any one of the element in array returns TRUE for condition
    ){
        throw new ApiError(400,"All fields are required")
    }

    //Checking if user alr exists
    const existedUser = await User.findOne({ // finds one document
        $or : [{ username } , { email }] //$or is used to check either username or email
    })

    if(existedUser){
        throw new ApiError(409,"User with username/email alr exists")
    }

    //Checking for images and making sure avatar is compulsary
    console.log(req.files)
    const avatarLocalPath =  req.files?.avatar[0]?.path  // returns the local path of the avatar image 
    
    
    //const coverImageLocalPath =  req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if( req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    //avatar made comppulsary
    if ( !avatarLocalPath ){
        throw new ApiError(400 , "Avatar Image is required")
    }

    //Upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    :null;
    
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

    console.log(createdUser)

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    //Returning api response using ApiResponse
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )


})

const loginUser = asyncHandler( async (req,res) => {
    // take data from req.body
    // login thru username or email
    // find user
    // if exists , check password
    // if checking done , generate access and refresh tokens
    // send cookie

    //taking data from frontend for login
    const { email , username , password } = req.body

    // checking if any one of them is provided for login
    if( !(username || email) ){
        throw new ApiError(400,"username or email is required")
    }

    //making use of $or to use either username or email to find user as per preference
    const user = await User.findOne({
        $or : [{ username },{ email }]
    })

    // if this user itself dosent exist it means that it wasnt created at all
    // Using isPasswordCorrect to make it compare the provided password and the password in the database
    if( !user ){
        throw new ApiError(404,"User dosent exist")
    }

    //if he exists -> chk password
    const isPasswordValid = await user.isPasswordCorrect(password)

    if( !isPasswordValid ){
        throw new ApiError(401,"Invalid User Credentials")
    }

    // MAKING A METHOD TO ACESS AND REFRESH TOKENS IN THE ABOVE AND EXECUTING IT 
    const { accessToken , refreshToken } = await generateAccessAndRefreshTokens(user._id)

    // after the generation of tokens ,  the user is logged in but the tokens of the user element declared 
    // before is diffrent so make the loggedInUser const again and dont show password and refTokens

    const loggedInUser = await User.findById(user._id).select("-password -refreshTokens")
    
    //Sending cookies

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser,accessToken,refreshToken
            },
            "User logged in sucessfully"
        )
    )
})

const logoutUser = asyncHandler( async (res,req) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set : { refreshToken : undefined}
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out sucessfully"))
})

export { 
    registerUser,
    loginUser ,
    logoutUser
}