import { Redis } from 'ioredis';
import config from '../config/config.ts'
import logger from '../utils/logger.ts';

const redis = new Redis({
    host: config.REDIS_HOST,
    port: Number(config.REDIS_PORT),
    password: config.REDIS_PASSWORD
})


redis.on('connect', () => {
    try{
        logger.info('Connected : to Redis database successfully')
    }
    catch(err){
        logger.error(err)
    }
})

export default redis;