import pg from 'pg';
import config from './config.ts';
import logger from '../utils/logger.ts';

const { Pool } = pg;

const pool = new Pool({
    connectionString: config.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
});

pool.on('error', (err) => {
    logger.error('Unexpected error on idle client', err);
});

const connectDB = async () => {
    try {
        await pool.query('select 1');
        logger.info('database : connected to postgresql');
    } catch (error) {
        logger.error('Error connecting to PostgreSQL:', error);
        process.exit(1);
    }
};

export default connectDB;
export { pool };