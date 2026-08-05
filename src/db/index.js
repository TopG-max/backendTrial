import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, { dbName: "videotube" });
        console.log(`\n MONGODB CONNECTED !! DB HOST : ${connectionInstance.connection.host}`);
        console.log("Connected:", connectionInstance.connection.readyState);
        console.log("Database:", connectionInstance.connection.name);
        console.log("Host:", connectionInstance.connection.host)
    }
    catch(error){
        console.log("MONGODB CONNECTION ERROR",error);
        process.exit(1)
    }
}

export default connectDB;