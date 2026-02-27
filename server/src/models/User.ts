import { Table, Column, Model, DataType, HasMany, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import bcrypt from 'bcrypt';
import Reading from './Reading';
import AIInterpretation from './AIInterpretation';
import Favorite from './Favorite';

@Table({
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['email'],
      name: 'users_email_unique'
    },
    {
      unique: true,
      fields: ['username'],
      name: 'users_username_unique'
    }
  ]
})
export default class User extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  username!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  @HasMany(() => Reading)
  readings!: Reading[];

  @HasMany(() => AIInterpretation, { onDelete: 'NO ACTION' })
  aiInterpretations!: AIInterpretation[];

  @HasMany(() => Favorite)
  favorites!: Favorite[];

  // Hash password before creating user
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(user: User) {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  }

  // Method to compare password
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Remove password from JSON response
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}
