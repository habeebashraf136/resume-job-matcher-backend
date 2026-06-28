import { ChatGroq } from '@langchain/groq';
import config from '../config/config.ts';
import { z } from 'zod';
import logger from '../utils/logger.ts';


const groq = new ChatGroq({
    apiKey: config.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
});

const resumeProfileSchema = z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    summary: z.string(),
    skills: z.array(z.string()).default([]),
    yearsOfExperience: z.number().min(0).optional(),
    targetRole: z.string(),
    preferredLocation: z.string().optional(),
    experience: z.array(z.object({
        jobTitle: z.string(),
        company: z.string(),
        duration: z.string().optional(),
        description: z.string().optional()
    })).default([]),
    education: z.array(z.object({
        degree: z.string(),
        institution: z.string(),
        year: z.string().optional()
    })).default([])
});


type ExtractProfileState = {
    rawText : string;
}

export const extractProfile = async (state: ExtractProfileState) => {
    if(!state.rawText){
        throw new Error('rawText is not defined in state');
    }

    try{
        const structuredData = groq.withStructuredOutput(resumeProfileSchema);

        const result = await structuredData.invoke([
            {
                role: 'system',
                content: `You are an expert resume parser.
                Extract key information from the resume text provided by the user.
                Follow these rules strictly:
                - Return ONLY valid JSON with exact camelCase field names
                - Do not rename or add extra fields
                - If a field is missing from the resume, return empty string for string fields or empty array for array fields`
            },
            {
                role: 'user',
                content: state.rawText
            }
        ]);

        return { resumeProfile: { ...result, rawText: state.rawText } };
    }
    catch (error: any) {
        logger.error('Extract Profile Node Error:', error);
        throw new Error(`Failed to extract resume profile: ${error.message}`);
    }
}
