import { email, z } from "zod";
import type { Request, Response, NextFunction } from 'express';

// Middleware factory
const validate = (schema: z.ZodType) => 
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        
        if (!result.success) {
            return res.status(400).json({
                errors: result.error.issues.map(err => ({
                    type: 'field',
                    msg: err.message,
                    path: err.path.join('.'),
                    location: 'body'
                }))
            });
        }
        
        req.body = result.data; // sanitized data
        next();
    };

// Register Schema
export const registerSchema = z.object({
    username: z.string()
        .trim()
        .min(1, 'Username is required'),

    email: z.string()
        .trim()
        .min(1, 'Email is required')
        .email('Email is not a valid email address'),

    password: z.string()
        .trim()
        .min(6, 'Password must be at least 6 characters')
        .regex(/[0-9]/, 'Password must contain number'),
});


export const loginSchema = z.object({
    email: z.string()
        .trim()
        .min(1, 'Email is required'),

    password: z.string()
        .trim()
        .min(6, 'Password must be at least 6 characters')
        .regex(/[0-9]/, 'Password must contain number'),
})




export const registerValidator = validate(registerSchema);
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginValidation = validate(loginSchema);
export type LoginInput = z.infer<typeof loginSchema>;