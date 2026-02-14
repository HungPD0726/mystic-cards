import { Request, Response } from 'express';
import { Card } from '../models';
import { Op } from 'sequelize';

export const getCards = async (req: Request, res: Response): Promise<void> => {
  try {
    const { group, search } = req.query;

    const where: any = {};

    if (group) {
      where.group = group;
    }

    if (search) {
      where.name = {
        [Op.like]: `%${search}%`,
      };
    }

    const cards = await Card.findAll({
      where,
      order: [['id', 'ASC']],
    });

    res.json({ cards });
  } catch (error: any) {
    console.error('Get cards error:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
};

export const getCardBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const card = await Card.findOne({
      where: { slug },
    });

    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    res.json({ card });
  } catch (error: any) {
    console.error('Get card error:', error);
    res.status(500).json({ error: 'Failed to fetch card' });
  }
};
