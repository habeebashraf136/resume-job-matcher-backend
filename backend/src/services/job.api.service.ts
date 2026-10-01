import axios from 'axios';
import config from '../config/config.ts';
import logger from '../utils/logger.ts';

const RAPIDAPI_HOST = 'jsearch.p.rapidapi.com';

export interface JobSearchResponse {
    jobId: string;
    title: string;
    company: string;
    location: string;
    description: string;
    url: string;
    jobType: string;
    salary?: string;
    postedAt?: string;
}

async function fetchJobs(query: string): Promise<any[]> {
    const response = await axios.get(`https://${RAPIDAPI_HOST}/search-v2`, {
        headers: {
            'X-RapidAPI-Key': config.RAPID_API_KEY_API,
            'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
        params: {
            query,
            num_pages: 1,
            date_posted: 'all',
            country: 'in',
        },
        timeout: 30000,
    });

    const jobs = response.data?.data?.jobs ?? response.data?.jobs ?? [];
    return Array.isArray(jobs) ? jobs : [];
}

export const jobApiService = {
    async searchJobs(params: {
        keywords?: string;
        location?: string;
        limit?: number;
    }): Promise<JobSearchResponse[]> {
        try {
            if (!config.RAPID_API_KEY_API) {
                throw new Error('RAPID_API_KEY_API is missing in configuration');
            }

            const limit = params.limit ?? 10;
            const keywords = params.keywords?.trim() || 'software engineer';
            const location = params.location?.trim();

            // Attempt 1: role + location
            let query = [keywords, location].filter(Boolean).join(' in ');
            let jobs = await fetchJobs(query);

            // Attempt 2: role only, if the location was too narrow
            if (jobs.length === 0 && location) {
                logger.warn('jobApiService: no jobs for query, retrying without location', { query });
                query = keywords;
                jobs = await fetchJobs(query);
            }

            if (jobs.length === 0) {
                logger.warn('jobApiService: no jobs found for query:', { query });
                return [];
            }

            const seen = new Set<string>();

            const unique = jobs
                .filter((job) => {
                    const id = job.job_id;
                    if (!id || seen.has(id)) return false;
                    seen.add(id);
                    return true;
                })
                .slice(0, limit);

            // Catches a renamed job_id field, which would otherwise fail silently
            if (unique.length === 0) {
                logger.error('jobApiService: jobs returned but none had job_id', {
                    sampleKeys: Object.keys(jobs[0] ?? {}),
                });
                return [];
            }

            return unique.map((job: any) => {
                const minSalary = job.job_min_salary;
                const maxSalary = job.job_max_salary;
                const currency = job.job_salary_currency ?? '';
                const salary =
                    minSalary && maxSalary
                        ? `${minSalary}-${maxSalary} ${currency}`.trim()
                        : job.job_salary_string || undefined;

                const postedAt = job.job_posted_at_datetime_utc ?? job.job_posted_at;

                const resolvedLocation =
                    job.job_city ||
                    job.job_state ||
                    job.job_country ||
                    (job.job_is_remote ? 'Remote' : (location || 'India'));

                return {
                    jobId: String(job.job_id),
                    title: String(job.job_title ?? ''),
                    company: String(job.employer_name ?? ''),
                    location: String(resolvedLocation),
                    description: String(job.job_description ?? ''),
                    url: String(job.job_apply_link ?? ''),
                    jobType: String(job.job_employment_type || 'full-time'),
                    ...(salary && { salary }),
                    ...(postedAt && { postedAt: String(postedAt) }),
                };
            });
        } catch (error: any) {
            logger.error('jobApiService: JSearch error', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw new Error(`JSearch API failed: ${error.response?.status || ''} ${error.message}`);
        }
    },
};