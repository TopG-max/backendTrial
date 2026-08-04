const asyncHandler = (requestHandler) => {
    (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}

export { asyncHandler }

// const asyncHandler = () => {}
// const asyncHandler = (func) => {() => {}}  ---> const asyncHandler = (func) => () => {}
// using async --> const asyncHandler = (func) => async ()=> {}


/* ANOTHER METHOD FOR THE ABOVE CODEE
const asyncHandler = (fn) => async (req , res , next) => {
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(err.code || 500).json({
            success : false ,
            message = err.message
        })
    }
}
    */