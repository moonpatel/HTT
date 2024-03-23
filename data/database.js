import mongoose from "mongoose";
import {MONGO_URI} from '../secrets.js'
console.log(MONGO_URI);
export const connectDB = async () => {
  try {
    const {connection} = await mongoose.connect(process.env.MONGO_URI, {
        // dbName:"sample_training"
    });
    console.log(`server connected to databse ${connection.host}`);
  } catch (error) {
    console.log("some error occured", error);
    process.exit(1);
  }
};
