import { Router } from 'express';
import * as cardController from '../controllers/cardController';

const router = Router();

// Get all cards (with optional filters)
router.get('/', cardController.getCards);

// Get card by slug
router.get('/:slug', cardController.getCardBySlug);

export default router;
