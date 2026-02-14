import { Response } from 'express';
import { validationResult } from 'express-validator';
import { Reading } from '../models';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

export const getReadings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Reading.findAndCountAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      readings: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error: any) {
    console.error('Get readings error:', error);
    res.status(500).json({ error: 'Failed to fetch readings' });
  }
};

export const createReading = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { spreadType, spreadName, drawnCards, notes } = req.body;

    const reading = await Reading.create({
      userId: req.user.id,
      spreadType,
      spreadName,
      drawnCards,
      notes,
    });

    res.status(201).json({
      message: 'Reading saved successfully',
      reading,
    });
  } catch (error: any) {
    console.error('Create reading error:', error);
    res.status(500).json({ error: 'Failed to save reading' });
  }
};

export const getReading = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const reading = await Reading.findOne({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!reading) {
      res.status(404).json({ error: 'Reading not found' });
      return;
    }

    res.json({ reading });
  } catch (error: any) {
    console.error('Get reading error:', error);
    res.status(500).json({ error: 'Failed to fetch reading' });
  }
};

export const deleteReading = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const reading = await Reading.findOne({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!reading) {
      res.status(404).json({ error: 'Reading not found' });
      return;
    }

    await reading.destroy();

    res.json({ message: 'Reading deleted successfully' });
  } catch (error: any) {
    console.error('Delete reading error:', error);
    res.status(500).json({ error: 'Failed to delete reading' });
  }
};
