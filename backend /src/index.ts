import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import appointmentRoutes from './routes/appointments';
import dentistRoutes from './routes/dentists';
import treatmentRoutes from './routes/treatments';
import { errorHandler, notFound } from './middleware/errorHandler';

dotenv.config();

console.log('Starting server initialization...');

const app: Express = express();
const PORT = process.env.PORT || 3000;

console.log('Configuring middleware...');

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

console.log('CORS configured');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('Body parsers configured');

// Health check route
app.get('/health', (req: Request, res: Response) => {
  console.log('Health check requested');
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

console.log('Health route registered');

// API Routes
app.get('/api', (req: Request, res: Response) => {
  res.json({ 
    message: 'Welcome to the Dental Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      appointments: '/api/appointments',
      dentists: '/api/dentists',
      treatments: '/api/treatments',
    }
  });
});

console.log('Registering API routes...');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dentists', dentistRoutes);
app.use('/api/treatments', treatmentRoutes);

console.log('API routes registered');

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

console.log('Starting server listen...');

// Start server
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
  console.log(`📚[docs]: API endpoints available at http://localhost:${PORT}/api`);
});
