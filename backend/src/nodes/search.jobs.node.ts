import { jobApiService } from '../services/job.api.service.ts';
import logger from '../utils/logger.ts';

type SearchJobsState = {
    resumeProfile: {
        targetRole: string;
        yearsOfExperience?: number;
        preferredLocation?: string;
        experience?: {
            jobTitle: string;
            company: string;
            duration?: string;
            description?: string;
        }[];
        skills: string[];
    };
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
        // throw instead of silent return — pipeline must fail loudly
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