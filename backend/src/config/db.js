import mongoose from "mongoose";
import { config } from "./config.js";
const connectToDb = async () => {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log('DB Connected');
    }
    catch (err) {
        console.error('DB Connection Error:', err);
        process.exit(1);
    }
};
export default connectToDb;
