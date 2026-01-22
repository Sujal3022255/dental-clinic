import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import appointmentRoutes from './routes/appointments';
import dentistRoutes from './routes/dentists';
import treatmentRoutes from './routes/treatments';
import contentRoutes from './routes/content';
import { errorHandler, notFound } from './middleware/errorHandler';
import { verifyEmailConfig } from './services/emailService';

dotenv.config();

console.log('Starting server initialization...');

// Verify email configuration on startup
verifyEmailConfig();

const app: Express = express();
const PORT = process.env.PORT || 3000;

console.log('Configuring middleware...');

// Security Headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 login attempts per windowMs (increased for development)
  message: 'Too many login attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

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
      users: '/api/users',
      appointments: '/api/appointments',
      dentists: '/api/dentists',
      treatments: '/api/treatments',
      content: '/api/content',
    }
  });
});

console.log('Registering API routes...');

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dentists', dentistRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/content', contentRoutes);

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
