import type { Document } from 'mongoose';
import mongoose from 'mongoose';


export interface IJobSearch extends Document{
    userid: mongoose.Types.ObjectId;
    resumeProfile: any;
    rankedJobs: Array<{
        jobid: string;
        title: string;
        company: string;
        location: string;
        score: number;
        matchReason: string;
        url?: string;
        salary?: string;
        jobType?: string;
        postedAt?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
