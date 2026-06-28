import { Pinecone } from '@pinecone-database/pinecone';
import config from './config.ts';
import logger from '../utils/logger.ts';

let pineconeClient: Pinecone | null = null;
let index: ReturnType<Pinecone['index']> | null = null;

export const initPinecone = async () => {
    try {
        if (!pineconeClient) {
            pineconeClient = new Pinecone({
                apiKey: config.PINECONE_API_KEY,
            });

            index = pineconeClient.index('resume-job-matcher');
            logger.info('Pinecone initialized');
        }

        return pineconeClient;

    } catch (error: any) {
        logger.error('Pinecone initialization failed', error);
        throw new Error('Failed to connect to Pinecone');
    }
};

export const getPineconeIndex = () => {
    if (!index) {
        throw new Error('Pinecone index not initialized. Call initPinecone() first.');
    }
    return index;
};