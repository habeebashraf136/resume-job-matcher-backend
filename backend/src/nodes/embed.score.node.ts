import { embeddingService } from '../services/embedding.service.ts';
import { pineconeService } from '../services/pinecone.service.ts';
import logger from '../utils/logger.ts';
import type { z } from 'zod';
import { resumeProfileSchema } from './extract.profile.node.ts'; // adjust path if needed

type ResumeProfile = z.infer<typeof resumeProfileSchema>;

type JobListing = {
    jobId: string;
    title: string;
    company: string;
    location: string;
    description: string;
    url: string;
    salary?: string;
    jobType: string;
    postedAt?: string;
};

type ScoredJob = JobListing & { similarityScore: number };

type EmbedScoreState = {
    userId: string;
    resumeProfile: ResumeProfile;
    jobListings: JobListing[] | null;
};

export const embedScoreNode = async (state: EmbedScoreState) => {
    if (!state?.resumeProfile) {
        throw new Error('resumeProfile is required for embedding');
    }

    if (!state?.userId) {
        throw new Error('userId is required for embedding');
    }

    if (!state?.jobListings?.length) {
        logger.warn('No jobs found for this search query');
        return { scoredJobs: [] };
    }

    const profileText = [
        state.resumeProfile.targetRole,
        state.resumeProfile.skills?.join(' '),
        state.resumeProfile.summary,
        state.resumeProfile.experience
            ?.map(e => e.jobTitle)
            .join(' ')
    ].filter(Boolean).join(' ');

    try {
        const resumeEmbedding = await embeddingService.getEmbedding(profileText);

        if (!resumeEmbedding?.length) {
            throw new Error('Mistral returned empty embedding');
        }

        await pineconeService.upsertResume(
            state.userId,
            resumeEmbedding,
            {
                targetRole: state.resumeProfile.targetRole,
                skills: state.resumeProfile.skills,
                ...(state.resumeProfile.preferredLocation && {
                    preferredLocation: state.resumeProfile.preferredLocation
                }),
                ...(state.resumeProfile.summary && {
                    summary: state.resumeProfile.summary
                })
            }
        );

        const results = await Promise.allSettled(
            state.jobListings.map(async (job): Promise<ScoredJob> => {
                const jobText = [
                    job.title,
                    job.company,
                    job.description,
                    job.location
                ].filter(Boolean).join(' ');

                const jobEmbedding = await embeddingService.getEmbedding(jobText);

                if (!jobEmbedding?.length) {
                    throw new Error(`Empty embedding for job: ${job.title}`);
                }

                const similarity = calculateCosineSimilarity(resumeEmbedding, jobEmbedding);

                return {
                    ...job,
                    similarityScore: Math.round(similarity * 100)
                };
            })
        );

        const scoredJobs = results
            .filter((r): r is PromiseFulfilledResult<ScoredJob> => r.status === 'fulfilled')
            .map(r => r.value);

        const failedCount = results.length - scoredJobs.length;
        if (failedCount > 0) {
            logger.warn(`${failedCount} job(s) failed to embed and were skipped`);
        }

        const sorted = scoredJobs.sort(
            (a, b) => b.similarityScore - a.similarityScore
        );

        return { scoredJobs: sorted };

    } catch (error: any) {
        throw new Error(`Embedding and scoring failed: ${error.message}`);
    }
};

function calculateCosineSimilarity(
    vecA: number[],
    vecB: number[]
): number {
    if (!vecA?.length || !vecB?.length) return 0;

    const dotProduct = vecA.reduce(
        (sum, a, i) => sum + a * (vecB[i] || 0), 0
    );
    const magnitudeA = Math.sqrt(
        vecA.reduce((sum, a) => sum + a * a, 0)
    );
    const magnitudeB = Math.sqrt(
        vecB.reduce((sum, b) => sum + b * b, 0)
    );

    return magnitudeA && magnitudeB
        ? dotProduct / (magnitudeA * magnitudeB)
        : 0;
};