import type { Document } from 'mongoose';
import type { JwtPayload } from 'jsonwebtoken';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface AccessTokenPayload extends JwtPayload {
    userid: string;
    exp: number;
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                userid: string;
                iat?: number;
                exp?: number;
            };
        }
    }
}

export {};