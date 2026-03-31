import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import activityRoutes from './routes/activityRoutes.js';


const app = express();

app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:5173',
    'https://saas-application-eight.vercel.app'
  ],
  credentials: true,
}));

// Webhook needs raw body, must be before express.json() if we want it global OR we can use it locally in the route.
// I'll keep it local in the route but I need to make sure express.json doesn't consume it first for the webhook path.

app.use((req, res, next) => {
  if (req.originalUrl === '/api/subscription/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/activity', activityRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI || '')
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err: any) => {
    console.error('Database connection error:', err);
  });
