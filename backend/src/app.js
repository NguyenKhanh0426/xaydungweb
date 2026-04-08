import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import vocabRoutes from './routes/vocab.routes.js';
import flashcardRoutes from './routes/flashcard.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import aiRoutes from './routes/ai.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { pingDatabase } from './config/db.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get('/api/health', async (req, res, next) => {
  try {
    await pingDatabase();
    res.json({ success: true, message: 'API and database are running' });
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', vocabRoutes);
app.use('/api', flashcardRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', aiRoutes);

app.use(errorMiddleware);

export default app;
