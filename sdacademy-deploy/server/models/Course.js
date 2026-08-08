import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  track: {
    type: DataTypes.ENUM('onboarding', 'core', 'role', 'leadership'),
    defaultValue: 'core',
  },
  department: {
    type: DataTypes.STRING,
    defaultValue: 'Architecture',
  },
  estimated_time: {
    type: DataTypes.STRING,
    defaultValue: '1h 30m',
  },
  thumbnail_color: {
    type: DataTypes.STRING,
    defaultValue: 'linear-gradient(135deg, #3b82f6, #1e2545)',
  },
}, {
  timestamps: true,
  tableName: 'courses',
});
