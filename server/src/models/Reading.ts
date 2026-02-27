import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne } from 'sequelize-typescript';
import User from './User';
import Spread from './Spread';
import AIInterpretation from './AIInterpretation';

@Table({
  tableName: 'readings',
  timestamps: true,
})
export default class Reading extends Model {
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

  @ForeignKey(() => Spread)
  @Column({
    type: DataType.INTEGER,
    allowNull: true, // Allow null if using custom spreads or simple draws
  })
  spreadId?: number;

  @BelongsTo(() => Spread)
  spread?: Spread;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  spreadType!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  spreadName!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('drawnCards');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value: any[]) {
      this.setDataValue('drawnCards', JSON.stringify(value));
    },
  })
  drawnCards!: any[];

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes?: string;

  @HasOne(() => AIInterpretation)
  aiInterpretation!: AIInterpretation;
}
