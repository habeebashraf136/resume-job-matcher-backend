import express from 'express';
import { findJobs, getJobSearchHistory } from '../controllers/job.match.controller.ts';
import { upload } from '../middlewares/upload.middleware.ts';
import { isAuthenticated } from '../middlewares/auth.middleware.ts';;
import { validateJobRequest } from '../validators/jobValidation.ts';


const jobMatchRouter = express.Router();

jobMatchRouter.post('/findJobs', upload.single('resume'), isAuthenticated, validateJobRequest, findJobs);

jobMatchRouter.get('/history', isAuthenticated, getJobSearchHistory);



export default jobMatchRouter;
