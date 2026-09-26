import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { authRouter } from './routes/auth';
import { medicalRouter } from './routes/medical';
import { emergencyRouter } from './routes/emergency';
import { bloodRouter } from './routes/blood';
import { hospitalsRouter } from './routes/hospitals';
import { adminRouter } from './routes/admin';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/medical', medicalRouter);
app.use('/api/emergency', emergencyRouter);
app.use('/api/blood', bloodRouter);
app.use('/api/hospitals', hospitalsRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'LifeGuard Emergency App', timestamp: new Date().toISOString() });
});

// Serve static frontend in production or if dist exists
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

// SPA fallback for React Router navigation
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` LifeGuard Server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=========================================`);
});
