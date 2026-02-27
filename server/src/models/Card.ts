import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import Favorite from './Favorite';

@Table({
  tableName: 'cards',
  timestamps: false,
})
export default class Card extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  slug!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  imagePath!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('keywords');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value: string[]) {
      this.setDataValue('keywords', JSON.stringify(value));
    },
  })
  keywords!: string[];

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  uprightMeaning!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  reversedMeaning!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  group!: string;

  @HasMany(() => Favorite)
  favorites!: Favorite[];
}
