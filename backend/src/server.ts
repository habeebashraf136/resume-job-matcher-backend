import app from './app.ts';
import logger from './utils/logger.ts';
import connectDB from './config/database.ts';
import { initPinecone } from './config/pinecone.ts';


const PORT = process.env.PORT || 4000;



const startServer = async () => {
  await connectDB();
  await initPinecone();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

startServer().catch(err => {
  logger.error('Failed to start server', err);
  process.exit(1);
})
