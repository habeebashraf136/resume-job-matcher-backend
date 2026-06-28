import { Mistral } from '@mistralai/mistralai';
import config from '../config/config.ts';

const mistral = new Mistral({
    apiKey: config.MISTRAL_API_KEY,
});

export const embeddingService = {
    async getEmbedding(text: string): Promise<number[]> {
        if (!text?.trim()) {
            throw new Error('Text is required for embedding');
        }

        const response = await mistral.embeddings.create({
            model: 'mistral-embed',
            inputs: text,
        });

        const embedding = response.data?.[0]?.embedding;

        if (!embedding?.length) {
            throw new Error('Mistral returned empty embedding');
        }

        return embedding;
    },

    async embedBatch(texts: string[]): Promise<number[][]> {
        if (!texts?.length) {
            throw new Error('Texts array is required for batch embedding');
        }

        const response = await mistral.embeddings.create({
            model: 'mistral-embed',
            inputs: texts,
        });

        return response.data.map(item => {
            if (!item.embedding?.length) {
                throw new Error('Mistral returned empty embedding in batch');
            }
            return item.embedding;
        });
    }
};