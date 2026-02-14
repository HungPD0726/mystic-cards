import { Router } from 'express';
import authRoutes from './auth';
import readingRoutes from './readings';
import cardRoutes from './cards';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/readings', readingRoutes);
router.use('/cards', cardRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

export default router;
