import dotenv from 'dotenv';
dotenv.config();
import logger from '../utils/logger.ts';


if(!process.env.DATABASE_URL){
    const err = new Error('DATABASE_URL is not defined in environment variables');
    logger.error(err);
    process.exit(1);
}

if(!process.env.REDIS_HOST){
    const err = new Error('REDIS_HOST is not defined in environment variables');
    logger.error(err);
    process.exit(1);
}

if(!process.env.REDIS_PORT){
    const err = new Error('REDIS_PORT is not defined in environment variables');
    logger.error(err);
    process.exit(1);
}

if(!process.env.REDIS_PASSWORD){
    const err = new Error('REDIS_PASSWORD is not defined in environment variables');
    logger.error(err);
    process.exit(1);
}

if(!process.env.NODE_ENV){
    const err = new Error('NODE_ENV is not defined in environment variables');
    logger.error(err);
    process.exit(1);
}

if(!process.env.REFRESH_TOKEN_SECRET){
    const err = new Error('REFRESH_TOKEN_SECRET is not defined in environment variables')
    logger.error(err);
    process.exit(1);
}

if(!process.env.ACCESS_TOKEN_SECRET){
    const err = new Error('ACCESS_TOKEN_SECRET is not defined in environment variables')
    logger.error(err);
    process.exit(1);
}

if(!process.env.OPENROUTER_API_KEY){
    const err = new Error('OPENROUTER_API_KEY is not defined in environment variables')
    logger.error(err);
    process.exit(1);
}

if(!process.env.PINECONE_API_KEY){
    const err = new Error('PINECONE_API_KEY is not defined in environment variables')
    logger.error(err);
    process.exit(1);
}

if(!process.env.MISTRAL_API_KEY){
    const err = new Error('MISTRAL_API_KEY is not defined in environment variables')
    logger.error(err);
    process.exit(1);
}

if(!process.env.RAPID_API_KEY_API){
    const err = new Error('RAPID_API_KEY_API is not defined in environment variables')
    logger.error(err);
    process.exit(1);
}

if(!process.env.GROQ_API_KEY){
    const err = new Error('GROQ_API_KEY is not defined in environment variables')
    logger.error(err);
    process.exit(1);
}



const config = {
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    NODE_ENV: process.env.NODE_ENV,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
    RAPID_API_KEY_API: process.env.RAPID_API_KEY_API,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
};

export default config;