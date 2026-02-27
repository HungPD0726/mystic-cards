import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import Reading from './Reading';

@Table({
  tableName: 'spreads',
  timestamps: true,
})
export default class Spread extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  numberOfCards!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  imageLayout?: string;

  @HasMany(() => Reading)
  readings!: Reading[];
}
