import axios from 'axios';
import config from '../config/config.ts';
import logger from '../utils/logger.ts';


const RAPIDAPI_HOST = 'jsearch.p.rapidapi.com';

export const jobApiService = {
    async searchJobs(params: {
        keywords?: string;
        location?: string;
        limit?: number;
    }) {
        try {
            if (!config.RAPID_API_KEY_API) {
                throw new Error('RAPID_API_KEY_API is missing in .env');
            }

            const query = [
                params.keywords || 'software engineer',
                params.location || ''
            ].filter(Boolean).join(' ').trim() || 'software engineer';
;

            const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
                headers: {
                    'X-RapidAPI-Key': config.RAPID_API_KEY_API,
                    'X-RapidAPI-Host': RAPIDAPI_HOST
                },
                params: {
                    query: query,
                    page: '1',
                    num_pages: Math.min(Math.ceil((params.limit || 15) / 10), 3),
                    country: 'us',          // Change to your country code if needed (e.g. 'in', 'gb')
                    date_posted: 'all',
                }
            });

            const jobs = response.data?.data || [];

            if (jobs.length === 0) {
                logger.warn('No jobs found - this is normal for bad queries');
                return [];
            }

            return jobs.map((job: any) => ({
                jobId: job.job_id,
                title: job.job_title,
                company: job.employer_name,
                location: job.job_city || job.job_state || job.job_country || params.location || 'Remote',
                description: job.job_description,
                url: job.job_apply_link,
                salary: job.job_salary ? `$${job.job_salary}` : undefined,
                jobType: job.job_employment_type || 'full-time',
                postedAt: job.job_posted_at
            }));

        } catch (error: any) {
            logger.error('JSEARCH ERROR:', {
                status: error.response?.status,
                data: error.response?.data
            });
            throw new Error(`JSearch API failed: ${error.response?.status || ''} ${error.message}`);
        }
    }
};