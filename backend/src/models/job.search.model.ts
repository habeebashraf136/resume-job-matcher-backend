import mongoose from 'mongoose';
import type { IJobSearch } from '../types/job.search.type.ts';


const jobSearchSchema = new mongoose.Schema<IJobSearch>(
   {
    userid:{
        type: mongoose.Types.ObjectId,
        required: true,
        index: true,
    },
    resumeProfile: {
      type: mongoose.Schema.Types.Mixed,   
      required: true
    },
    rankedJobs: {
        type : [
            {
                jobid: { type: String, required: true },
                title: { type: String, required: true },
                company: { type: String, required: true },
                location: { type: String, required: true },
                score: {
                    type: Number,
                    required: true,
                    min: 0, 
                    max: 100,
                },
                matchReason: { type: String, required: true },
                url: { type: String, required: true },
                salary: { type: String, optional: true },
                jobType: { type: String, required: true },
                postedAt: { type: String},
            }
        ],
        default: []
    }
   },
   {
    timestamps: true
   }
);

jobSearchSchema.index({ userid: 1, createdAt: -1 });

const jobSearchModel = mongoose.model<IJobSearch>('JobSearch', jobSearchSchema);

export default jobSearchModel;
