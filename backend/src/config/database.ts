import pg from 'pg';
import config from './config.ts';
import logger from '../utils/logger.ts';
// import type { connect } from 'node:http2';

const { Pool } = pg


const pool = new Pool({
    connectionString : config.DATABASE_URL,
});


const connectDB = async () => {
    try{
        await pool.connect();
        logger.info("database : connected to postgresql")
    }
    catch(error){
        logger.error('Error connecting to PostgreSQL:', error);
        process.exit(1);
    }
}

export default connectDB;
export { pool };
