import { jobApiService } from '../services/job.api.service.ts';
import logger from '../utils/logger.ts';
import type { z } from 'zod';
import { resumeProfileSchema } from './extract.profile.node.ts'; // adjust path to match your actual file location

type ResumeProfile = z.infer<typeof resumeProfileSchema>;

type SearchJobsState = {
    resumeProfile: ResumeProfile;
};

const JOBS_LIMIT = 15;

export const searchJobs = async (state: SearchJobsState) => {
    const profile = state.resumeProfile;

    const keywords = [
        profile.targetRole,
        ...(profile.skills?.slice(0, 3) ?? [])
    ]
        .filter(Boolean)
        .join(', ') || 'software engineer';

    const location = profile.preferredLocation?.trim() || undefined;

    try {
        const jobs = await jobApiService.searchJobs({
            keywords,
            limit: JOBS_LIMIT,
            ...(location && { location })
        });

        if (!jobs?.length) {
            logger.warn('searchJobsNode: No jobs returned for query:', { keywords, location });
        }

        return { jobListings: jobs ?? [] };

    } catch (error: any) {
        logger.error('searchJobsNode: Error searching jobs:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            keywords,
            location
        });
        throw new Error(`Failed to search jobs: ${error.message}`);
    }
};