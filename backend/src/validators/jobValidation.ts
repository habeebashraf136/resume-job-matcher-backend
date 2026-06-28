import type { Request, Response, NextFunction } from 'express';

export const validateJobRequest = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.file) {
        res.status(400).json({
            success: false,
            message: 'Resume PDF file is required'
        });
        return;
    }

    next();
};