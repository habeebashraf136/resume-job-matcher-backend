import { pool }  from '../config/database.ts';
import logger from '../utils/logger.ts';

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
        logger.warn('saveResultsNode: no ranked jobs to save');
        return { success: false, jobSearchId: null, rankedJobs: [] };
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN')

        const jobSearchResult = await client.query(
            `insert into job_searches (userid,resume_profile) 
            values ($1,$2)
            returning id`,
            [state.userId, JSON.stringify(state.resumeProfile || {})]
        );

        const jobSearchId = jobSearchResult.rows[0].id;

        const values: any[] = [];
        const placeholders: string[] = [];

        state.rankedJobs.forEach((job,i)=> {
            const offset = i * 10;
            placeholders.push(
                `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10})`
            )
            values.push(
                jobSearchId,
                job.jobId,
                job.title,
                job.company,
                job.location,
                job.score,
                job.matchReason,
                job.url,
                job.salary ?? null,
                job.jobType
            )
        });

        await client.query(
            `INSERT INTO ranked_jobs
                (job_search_id, jobid, title, company, location, score, match_reason, url, salary, job_type)
             VALUES ${placeholders.join(', ')}`,
            values
        );

        await client.query('COMMIT');

        return {
            success: true,
            jobSearchId,
            rankedJobs: state.rankedJobs
        };
        
    } catch (error: any) {
        await client.query('ROLLBACK');
        logger.error('saveResultsNode: failed to save results', { message: error.message, userId: state.userId });
        throw new Error(`Failed to save results: ${error.message}`);
    } finally {
        client.release();
    }
};