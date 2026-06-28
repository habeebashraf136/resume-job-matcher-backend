import { ChatOpenAI } from '@langchain/openai';
import config from '../config/config.ts';
import { z } from 'zod';

const model = new ChatOpenAI({
    apiKey: config.OPENROUTER_API_KEY,
    modelName: 'google/gemma-4-26b-a4b-it',
    configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
    }
});

const RankedJobSchema = z.object({
    rankedJobs: z.array(z.object({
        jobId: z.string(),
        score: z.number().min(0).max(100),
        matchReason: z.string()
    }))
});

type ScoredJob = {
    jobId: string;
    title: string;
    company: string;
    location: string;
    description: string;
    url: string;
    salary?: string;
    jobType: string;
    postedAt?: string;
    similarityScore: number;
};

type RankMatchesState = {
    resumeProfile: {
        targetRole: string;
        skills: string[];
        summary?: string;
        yearsOfExperience?: number;
        preferredLocation?: string;
    };
    scoredJobs: ScoredJob[];
};

export const rankMatchesNode = async (state: RankMatchesState) => {
    if (!state?.scoredJobs?.length) {
        return { rankedJobs: [] };
    }

    const profileSummary = [
        `Target Role: ${state.resumeProfile.targetRole}`,
        `Skills: ${state.resumeProfile.skills?.join(', ')}`,
        state.resumeProfile.summary && `Summary: ${state.resumeProfile.summary}`,
        state.resumeProfile.yearsOfExperience && `Years of Experience: ${state.resumeProfile.yearsOfExperience}`,
        state.resumeProfile.preferredLocation && `Preferred Location: ${state.resumeProfile.preferredLocation}`
    ].filter(Boolean).join('\n');

    const jobsSummary = state.scoredJobs.map(job => ({
        jobId: job.jobId,
        title: job.title,
        company: job.company,
        location: job.location,
        jobType: job.jobType,
        similarityScore: job.similarityScore
    }));

    try {
        const structuredModel = model.withStructuredOutput(RankedJobSchema);

        const result = await structuredModel.invoke([
            {
                role: 'system',
                content: `You are an expert career advisor.
                Rank jobs based on how well they match the candidate profile.
                Follow these rules strictly:
                - Return every job that is given to you, do not skip any
                - Score each job from 0 to 100 based on match quality
                - Write matchReason in 1-2 sentences explaining why the job fits or does not fit
                - Use the same jobId from the input, do not change it`
            },
            {
                role: 'user',
                content: `Candidate Profile:\n${profileSummary}\n\nJobs to Rank:\n${JSON.stringify(jobsSummary, null, 2)}`
            }
        ]);

        const rankedJobs = result.rankedJobs
            .map(ranked => {
                const original = state.scoredJobs.find(
                    j => j.jobId === ranked.jobId
                );
                if (!original) return null;
                return {
                    ...original,
                    score: ranked.score,
                    matchReason: ranked.matchReason
                };
            })
            .filter(Boolean)
            .sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0));

        return { rankedJobs };

    } catch (error: any) {
        throw new Error(`Failed to rank jobs: ${error.message}`);
    }
};