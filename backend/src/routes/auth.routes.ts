import express from "express";
import { registerUser,loginController,getAccessToken,getUserInfo,logoutUser } from "../controllers/auth.controller.ts";
import { registerValidator,loginValidation } from "../validators/authValidation.ts";
import { isAuthenticated } from '../middlewares/auth.middleware.ts';
import { authLimiter } from '../utils/ratelimit.ts';


const authRouter = express.Router();

// @Route POST /api/auth/register
// @Desc Register a new user
// @Access Public
authRouter.post('/register', authLimiter, registerValidator, registerUser);

// @Route POST /api/auth/login
// @Desc Login a user
// @Access Public
authRouter.post('/login', authLimiter, loginValidation, loginController)

// @Route get /api/auth/refresh
// @Desc get a new access token
// @Access Public
authRouter.get('/get-refresh', getAccessToken);

// @Router get /api/auth/get-user
// @Desc get user info
// @Access Private
authRouter.get('/get-user', isAuthenticated, getUserInfo);

// @Route POST /api/auth/logout
// @Desc Logout a user
// @Access Private
authRouter.post('/logout', isAuthenticated, logoutUser);



export default authRouter;