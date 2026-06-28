import mongoose from 'mongoose';
import config from './config.ts';
import logger from '../utils/logger.ts';


const connectDB = async () => {
    try{
        const conn = await mongoose.connect(config.MONGODB_URI)
        logger.info(`database Connected: connected to MongoDB`);
    } catch (error) {
        logger.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

export default connectDB;