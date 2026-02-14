import { Router } from 'express';
import { body } from 'express-validator';
import * as readingController from '../controllers/readingController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All reading routes require authentication
router.use(authenticate);

// Get all readings for current user (with pagination)
router.get('/', readingController.getReadings);

// Create new reading
router.post(
  '/',
  [
    body('spreadType').notEmpty().withMessage('Spread type is required'),
    body('spreadName').notEmpty().withMessage('Spread name is required'),
    body('drawnCards').isArray().withMessage('Drawn cards must be an array'),
  ],
  readingController.createReading
);

// Get specific reading
router.get('/:id', readingController.getReading);

// Delete reading
router.delete('/:id', readingController.deleteReading);

export default router;
