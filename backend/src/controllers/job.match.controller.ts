import asyncHandler from "../utils/asyncHandler.ts";
import type { Request, Response } from "express";
import { jobMatchGraph } from '../graph/job.match.graph.ts';
import { pool } from '../config/database.ts';


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

     const result = await pool.query(`
        select
        js.id as job_search_id,
        js.created_at,
        js.resume_profile->>'targetRole' as target_role,
        rj.title, rj.company,rj.location,rj.score,rj.match_reason,rj.url
        from job_searches js
        join ranked_jobs rj ON rj.job_search_id =js.id
        where js.userid = $1
        order by js.created_at DESC, rj.score DESC;`,
     [userid]);

     return res.status(200).json({
        success: true,
        message: 'Job search history retrieved successfully',
        data: result.rows
     })
})