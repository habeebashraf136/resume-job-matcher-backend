import { ChatGroq } from '@langchain/groq';
import config from '../config/config.ts';
import { z } from 'zod';
import logger from '../utils/logger.ts';

const groq = new ChatGroq({
    apiKey: config.GROQ_API_KEY,
    model: 'openai/gpt-oss-120b',
});

export const resumeProfileSchema = z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    summary: z.string(),
    skills: z.array(z.string()).default([]),
    yearsOfExperience: z.number().min(0).default(0),
    targetRole: z.string(),
    preferredLocation: z.string().nullish(),
    experience: z.array(z.object({
        jobTitle: z.string(),
        company: z.string(),
        startDate: z.string().nullish(),
        endDate: z.string().nullish(),
        description: z.string().nullish()
    })).default([]),
    education: z.array(z.object({
        degree: z.string(),
        institution: z.string(),
        year: z.string().nullish()
    })).default([])
});

type ResumeProfile = z.infer<typeof resumeProfileSchema>;
type ExperienceEntry = ResumeProfile['experience'][number];

function parseYearMonth(value: string): Date | null {
    const match = value.trim().match(/^(\d{4})-(\d{1,2})$/);
    if (!match) {
        logger.warn(`Could not parse date: "${value}"`);
        return null;
    }
    const [, year, month] = match;
    return new Date(Number(year), Number(month) - 1, 1);
}

function isOngoing(endDate?: string | null): boolean {
    if (!endDate) return true;
    const normalized = endDate.trim().toLowerCase();
    return normalized === 'present' || normalized === 'current' || normalized === 'ongoing';
}

function calculateYearsOfExperience(experience?: ExperienceEntry[]): number {
    if (!experience) return 0;

    let totalMonths = 0;

    for (const job of experience) {
        if (!job.startDate) continue;

        const start = parseYearMonth(job.startDate);
        const end = isOngoing(job.endDate)
            ? new Date()
            : parseYearMonth(job.endDate as string);

        if (!start || !end) continue;

        // +1 makes the count inclusive: Jan to Mar = 3 months
        const months = (end.getFullYear() - start.getFullYear()) * 12
            + (end.getMonth() - start.getMonth()) + 1;

        totalMonths += Math.max(months, 0);
    }

    return Math.round((totalMonths / 12) * 100) / 100;
}

type ExtractProfileState = {
    rawText: string;
};

export const extractProfile = async (state: ExtractProfileState) => {
    if (!state.rawText) {
        throw new Error('rawText is not defined in state');
    }

    try {
        const structuredData = groq.withStructuredOutput(resumeProfileSchema);

        const result = await structuredData.invoke([
            {
                role: 'system',
                content: `You are an expert resume parser.
                Extract key information from the resume text provided by the user.
                Follow these rules strictly:
                - Return ONLY valid JSON with exact camelCase field names
                - Do not rename or add extra fields
                - Always include every field in the JSON. Never omit a field.
                - For required text fields missing from the resume, return an empty string. The only exception is targetRole (see the rules below).
                - For missing lists (skills, experience, education), return an empty array
                - For optional fields that are not in the resume (preferredLocation, startDate, endDate, description, year), set the value to null

                Rules for targetRole:
                - targetRole must always be a real job title such as "Backend Developer" or "Frontend Developer".
                - If the resume states a job objective or headline, use it.
                - If it does not, infer the best-fitting job title from the skills, projects and experience.
                - Never return an empty string, "General Application", "Fresher", "Student" or "Intern" on its own.

                Rules for experience:
                - Only count real work experience: jobs and internships. Do NOT count personal, academic, or side projects as experience, even if described with professional-sounding language.
                - For each experience entry, extract startDate and endDate in "YYYY-MM" format if possible. If the resume only gives a year, use "YYYY-01" as a fallback.
                - If a job is currently ongoing, set endDate to "Present".
                - If no work experience exists at all, leave the experience array empty.
                - Do NOT calculate total years of experience yourself. Set yearsOfExperience to 0. It will be calculated separately.`
            },
            {
                role: 'user',
                content: state.rawText
            }
        ]);

        const yearsOfExperience = calculateYearsOfExperience(result.experience);

        return {
            resumeProfile: {
                ...result,
                yearsOfExperience,
                rawText: state.rawText
            }
        };

    } catch (error: any) {
        logger.error('Extract Profile Node Error:', error);
        throw new Error(`Failed to extract resume profile: ${error.message}`);
    }
};