import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Reading from './Reading';
import User from './User';

@Table({
  tableName: 'ai_interpretations',
  timestamps: true,
})
export default class AIInterpretation extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => Reading)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  readingId!: number;

  @BelongsTo(() => Reading)
  reading!: Reading;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'NO ACTION',
  })
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  modelName?: string;
}
