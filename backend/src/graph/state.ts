import { Annotation } from '@langchain/langgraph';

type ResumeProfile = {
    name?: string;
    email?: string;
    phone?: string;
    summary?: string;
    skills: string[];
    yearsOfExperience?: number;
    targetRole: string;
    preferredLocation?: string;
    rawText: string;
    experience: {
        jobTitle: string;
        company: string;
        duration?: string;
        description?: string;
    }[];
    education: {
        degree: string;
        institution: string;
        year?: string;
    }[];
};

type JobListing = {
    jobId: string;
    title: string;
    company: string;
    location: string;
    description: string;
    url: string;
    salary?: string;
    jobType: string;
    postedAt?: string;
};

type ScoredJob = JobListing & {
    similarityScore: number;
};

type RankedJob = ScoredJob & {
    score: number;
    matchReason: string;
};

export const GraphState = Annotation.Root({
    // input from controller
    filePath: Annotation<string>(),
    userId: Annotation<string>(),

    // added by parseResumeNode
    rawText: Annotation<string>(),

    // added by extractProfileNode
    resumeProfile: Annotation<ResumeProfile>(),

    // added by searchJobsNode
    jobListings: Annotation<JobListing[]>(),

    // added by embedScoreNode
    scoredJobs: Annotation<ScoredJob[]>(),

    // added by rankMatchesNode
    rankedJobs: Annotation<RankedJob[]>(),
});