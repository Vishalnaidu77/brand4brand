import mongoose from "mongoose"
import { config } from "./config.js"
import dns from 'dns'

const connectToDb = async () => {
    try {
        dns.setServers(['1.1.1.1', '8.8.8.8']);
        await mongoose.connect(config.MONGO_URI as string)
        console.log('DB Connected');
    } catch (err: any) {
        console.error('DB Connection Error:', err);
        process.exit(1)
    }
}

export default connectToDb;