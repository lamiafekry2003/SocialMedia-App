import mongoose from "mongoose";

 const connectDB = async()=>{
    try {
       const connection= await mongoose.connect(process.env.DB_URL as string,{
            serverSelectionTimeoutMS:5000
        })
        console.log(`database connected ${connection.connection.host}`)
    } catch (error ) {
         console.log('Database Connection Error',(error as Error).message)
    }
 }
 export default connectDB;