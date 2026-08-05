import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('learner', 'admin'),
    defaultValue: 'learner',
  },
  department: {
    type: DataTypes.STRING,
    defaultValue: 'Architecture',
  },
  role_label: {
    type: DataTypes.STRING,
    defaultValue: 'Architect',
  },
  initials: {
    type: DataTypes.STRING,
    defaultValue: 'JA',
  },
}, {
  timestamps: true,
  tableName: 'users',
});
