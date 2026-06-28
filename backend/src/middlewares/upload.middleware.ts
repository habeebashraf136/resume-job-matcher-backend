import multer from 'multer';
import type { Request } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/'),
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

export const upload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024   // 5MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});