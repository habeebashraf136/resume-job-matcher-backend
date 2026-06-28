import { getPineconeIndex } from '../config/pinecone.ts';

type ResumeMetadata = {
    targetRole?: string;
    skills?: string[];
    preferredLocation?: string;
    summary?: string;
};

export const pineconeService = {
    async upsertResume(
        userId: string,
        embedding: number[],
        metadata: ResumeMetadata
    ) {
        const index = getPineconeIndex();

        await index.upsert({
            records: [{
                id: `resume-${userId}`,
                values: embedding,
                metadata: {
                    userId,
                    type: 'resume',
                    ...metadata
                }
            }]
        });
    },

    async query(
        userId: string,
        queryEmbedding: number[],
        topK: number = 10
    ) {
        const index = getPineconeIndex();

        const result = await index.query({
            vector: queryEmbedding,
            topK,
            includeMetadata: true,
            filter: { userId }
        });

        return result.matches || [];
    },

    async deleteResume(userId: string) {
        const index = getPineconeIndex();
        await index.deleteMany([`resume-${userId}`]);
    }
};