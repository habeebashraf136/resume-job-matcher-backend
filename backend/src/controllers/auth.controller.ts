import userModel from '../models/auth.model.ts';
import type { Request, Response } from "express";
import asyncHandler from '../utils/asyncHandler.ts';
import jwt from 'jsonwebtoken';
import config from '../config/config.ts';
import redis from '../config/redis.ts';
import type { AccessTokenPayload } from '../types/auth.types.ts';



const generateAccessToken = (userid: any) => {
    return jwt.sign(
        {userid},
        config.ACCESS_TOKEN_SECRET,
        {expiresIn:'15m'}
    )
} 

const generateRefreshToken = (userid: any) => {
    return jwt.sign(
        {userid},
        config.REFRESH_TOKEN_SECRET,
        {expiresIn:'7d'}
    )
}

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    if(!username || !email || !password){
        return res.status(400).json({
            message:'Please provide username, email, and password'
        });
    }

    const userExists = await userModel.findOne({
        $or:[{username},{email}],
    });

    if(userExists){
        return res.status(400).json({
            message:'User already exists'
        });
    }

    const user = await userModel.create({
        username,
        email,
        password,
    });

    const refreshToken = generateRefreshToken(user._id);
    const accessToken = generateAccessToken(user._id);

    await redis.set(`refresh:${user._id}`, refreshToken, 'EX', 2592000)
    
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
    })

    return res.status(201).json({
        success: true,
        message: 'User created successfully',
        user:{
            useid: user._id,
            username: user.username,
            email: user.email,
        },
        accessToken,
    })
});

export const loginController = asyncHandler(async (req: Request, res: Response) =>{
    const { email, password } = req.body;

    const user = await userModel.findOne({email}).select('+password');

    if(!user){
        return res.status(400).json({
            message:'User does not exist'
        });
    }

    const isMatch = await user.comparePassword(password);

    if(!isMatch){
        return res.status(400).json({
            message:'Invalid credentials'
        });
    }

    const refreshToken = generateRefreshToken(user._id);
    const accessToken = generateAccessToken(user._id);

    await redis.set(`refresh:${user._id}`, refreshToken, 'EX', 2592000);

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
    })


    return res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        user:{
            useid: user._id,
            username: user.username,
            email: user.email,
        },
        accessToken,
    })
})

export const getAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(400).json({
            message:'No refresh token found'
        });
    }

    const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET) as AccessTokenPayload;

    const stored = await redis.get(`refresh:${decoded.userid}`);

    if(stored !== refreshToken){
        return res.status(400).json({
            success:false,
            message:'Invalid refresh token',
        });
    }

    const accessToken = generateAccessToken(decoded.userid);

    return res.status(200).json({
        success:true,
        message:'User refreshed successfully',
        accessToken
    })
});

export const getUserInfo = asyncHandler(async (req: Request, res: Response) => {
    const userid = req.user?.userid;

    if(!userid){
        return res.status(400).json({
            message:'User ID not found'
        });
    }

    const user = await userModel.findById(userid).select('-password');

    if(!user){
        return res.status(400).json({
            message:'User does not exist'
        });
    }

    return res.status(200).json({
        success: true,
        message: 'User info retrieved successfully',
        user:{
            useid: user._id,
            username: user.username,
            email: user.email,
        }
    })
})  

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(400).json({
            success:false,
            message:'Please provide a refresh token',
        });
    }

    try{
        const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET) as AccessTokenPayload;
        await redis.del(`refresh:${decoded.userid}`);

        const authHeader = req.headers.authorization;
        const accessToken = authHeader ? authHeader.split(' ')[1] : null;

        if(accessToken){
            const decodedAccess = jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET) as AccessTokenPayload;
            const remainingTime = (decodedAccess?.exp || 0) - Math.floor(Date.now() / 1000);

            if(remainingTime > 0){
                    await redis.set(`blacklist:${accessToken}`, 'true', 'EX', remainingTime);
            }
        }
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid token or refresh token"
        });
    }

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.status(200).json({
        success: true,
        message: "User logged out successfully"
    });
})