import JobSearch from '../models/job.search.model.ts';

type RankedJob = {
    jobId: string;
    title: string;
    company: string;
    location: string;
    score: number;
    matchReason: string;
    url: string;
    salary?: string;
    jobType: string;
    postedAt?: string;
};

type SaveResultsState = {
    userId: string;
    resumeProfile: object;
    rankedJobs: RankedJob[];
};

export const saveResultsNode = async (state: SaveResultsState) => {
    if (!state?.userId) {
        throw new Error('userId is required to save results');
    }

    if (!state?.rankedJobs?.length) {
        return {
            ...state,                    // Keep existing state
            jobListings: [],             // Empty list
            message: "No jobs to save",    // Or better message
            success: false,              // Optional
            error: null,                 // Optional
        };
    }

    try {
        const jobSearch = new JobSearch({
            userid: state.userId,
            resumeProfile: state.resumeProfile || {},
            rankedJobs: state.rankedJobs.map(job => ({
                jobid: job.jobId,
                title: job.title,
                company: job.company,
                location: job.location,
                score: job.score,
                matchReason: job.matchReason,
                url: job.url,
                jobType: job.jobType
            }))
        });

        await jobSearch.save();

        return {
            success: true,
            jobSearchId: jobSearch._id.toString(),
            rankedJobs: state.rankedJobs
        };

    } catch (error: any) {
        throw new Error(`Failed to save results: ${error.message}`);
    }
};