import mongoose from "mongoose";

const connectDB = async ()=>{
  mongoose.connection.on('connected',()=>console.log("connection a la BD a été éffectuer")  
  );
    await mongoose.connect(`${process.env.MONGODB_URL}/Autoflow`);
};

export default connectDB;