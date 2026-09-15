import cors from 'cors';
import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import pointsRoutes from './routes/points.routes';

const app = express();

app.use(express.json());

// cors for all responses as it's just a simple app
app.use(cors());

// Routes
app.use('/api/points', pointsRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
