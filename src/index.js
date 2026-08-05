//require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
//import mongoose from "mongoose";
//import { DB_NAME } from "./constants";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});
console.log("URI:", process.env.MONGODB_URI);

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,() => {
        console.log(`Server running at port : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("DB connection failed : ",err);
})





/*
import express from "express";
const app = express()


( async ()=>{
    try{
        mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error",(error) => {
            console.log("ERR : ", error)
        });

        app.listen(process.env.PORT , () => {
            console.log(`App is listening on PORT ${process.env.PORT}`);
        })
    }
    catch(error){
        console.error("ERROR : ",error);
        throw error;
    }
})()
    */