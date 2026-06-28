import asyncHandler from "../utils/asyncHandler.ts";
import type { Request, Response } from "express";
import { jobMatchGraph } from '../graph/job.match.graph.ts';
import JobSearch from '../models/job.search.model.ts';


export const findJobs = asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    const userid = req.user?.userid;

    if(!file) {
        return res.status(400).json({
            success: false,
            message: 'Resume PDF file is required'
        });
    }

    if(!userid) {
        return res.status(400).json({
            success: false,
            message: 'userId is required'
        });
    }

    const result = await jobMatchGraph.invoke({
        filePath: file.path,
        userId: userid
    })

    if(result?.rankedJobs?.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No matching jobs found for this resume'
        });
    }

    return res.status(201).json({
        success: true,
        message: 'Job matching completed successfully',
        data: {
            rankedJobs: result.rankedJobs ?? []
        }
    })
})

export const getJobSearchHistory = asyncHandler(async (req:Request, res:Response) => {
     const userid = req.user?.userid;

     if(!userid) {
        return res.status(400).json({
            success: false,
            message: 'userId is required'
        });
     }

     const result = await JobSearch.find({userid}).sort({createdAt: -1});

     return res.status(200).json({
        success: true,
        message: 'Job search history retrieved successfully',
        data: result
     })
})