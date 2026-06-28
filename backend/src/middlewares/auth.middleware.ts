import jwt from 'jsonwebtoken';
import config from '../config/config.ts';
import redis from '../config/redis.ts';


export const isAuthenticated= async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Please provide a token',
        });
    }

    const accessToken = authHeader.split(' ')[1];

    if(!accessToken){
        return res.status(401).json({
            success:false,
            message:'Please provide a token',
        });
    }

    try{
        const isBlacklisted = await redis.get(`blacklist:${accessToken}`);

        if(isBlacklisted){
            return res.status(401).json({
                success:false,
                message:'Token is blacklisted',
            });
        }

        const decoded = jwt.verify(
            accessToken,
            config.ACCESS_TOKEN_SECRET
        )
        req.user = decoded;
        next();
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:'Invalid token',
        });
    }
}