import { ChatOpenAI } from '@langchain/openai';
import config from '../config/config.ts';
import { z } from 'zod';
import { resumeProfileSchema } from './extract.profile.node.ts';
import logger from '../utils/logger.ts';

type ResumeProfile = z.infer<typeof resumeProfileSchema>;

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
    resumeProfile: Pick<
        ResumeProfile,
        'targetRole' | 'skills' | 'summary' | 'yearsOfExperience' | 'preferredLocation'
    >;
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
        typeof state.resumeProfile.yearsOfExperience === 'number' &&
            `Years of Experience: ${state.resumeProfile.yearsOfExperience}`,
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
                content: `You are an expert career advisor scoring job matches for a candidate.

You will receive a candidate profile and a list of jobs, each with a "similarityScore" (0-100) that was already computed from resume/job text embeddings. Treat similarityScore as a starting signal, not the final answer — your job is to refine it using factors embeddings cannot capture.

Score each job 0-100 based on:
- Role alignment: does the job title/description match the candidate's targetRole, not just similar keywords?
- Experience fit: does the job's seniority level match the candidate's yearsOfExperience? Penalize jobs clearly above or below the candidate's level.
- Location fit: if preferredLocation is set and the job's location doesn't match or isn't remote, lower the score moderately — do not eliminate the job entirely for this alone.
- Skill overlap: reward jobs whose title/description reflect the candidate's listed skills.

Rules — follow exactly, no exceptions:
- Return every job you were given. Do not skip, omit, or merge any.
- Use the exact same "jobId" string from the input for each job. Never alter, shorten, or regenerate an ID.
- matchReason must be 1-2 sentences, specific to that job (mention the actual role/skill/location reason) — never a generic sentence reused across jobs.
- Output valid data only. Do not invent jobs that were not in the input.`
            },
            {
                role: 'user',
                content: `Candidate Profile:\n${profileSummary}\n\nJobs to Rank:\n${JSON.stringify(jobsSummary, null, 2)}`
            }
        ]);

        const rankedJobs = result.rankedJobs
            .map(ranked => {
                const original = state.scoredJobs.find(j => j.jobId === ranked.jobId);
                if (!original) {
                    logger.warn(`rankMatchesNode: LLM returned unknown jobId, dropping: ${ranked.jobId}`);
                    return null;
                }
                return {
                    ...original,
                    score: ranked.score,
                    matchReason: ranked.matchReason
                };
            })
            .filter((job): job is NonNullable<typeof job> => job !== null)
            .sort((a, b) => b.score - a.score);

        if (rankedJobs.length !== state.scoredJobs.length) {
            logger.warn(
                `rankMatchesNode: expected ${state.scoredJobs.length} jobs, got ${rankedJobs.length} after ranking`
            );
        }

        return { rankedJobs };

    } catch (error: any) {
        throw new Error(`Failed to rank jobs: ${error.message}`);
    }
};