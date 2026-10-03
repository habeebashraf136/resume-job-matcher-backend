import express from 'express';
import authRouter from './routes/auth.routes.ts';
import errorMiddleware from './middlewares/error.middleware.ts';
import cookieParser from 'cookie-parser';
import { apiLimiter } from './utils/ratelimit.ts';
import jobMatchRouter from './routes/job.match.routes.ts';
import cors from 'cors';
import config from './config/config.ts';


const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

app.use(cors({
    origin: config.FRONTEND_URL,
    credentials: true,
}));


app.get('/', (req: express.Request, res: express.Response) => { 
    return res.status(200).json({
        message: 'server is running'
    })
});


app.use('/api/auth', authRouter);
app.use('/api/job-match', jobMatchRouter);

app.use(errorMiddleware);

export default app;
