import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import User from './User';
import Card from './Card';

@Table({
  tableName: 'favorites',
  timestamps: true,
})
export default class Favorite extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Card)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  cardId!: number;

  @BelongsTo(() => Card)
  card!: Card;
}
