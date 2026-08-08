import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const UserProgress = sequelize.define('UserProgress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  module_id: {
    type: DataTypes.INTEGER,
  },
  status: {
    type: DataTypes.ENUM('not_started', 'in_progress', 'completed', 'due', 'overdue'),
    defaultValue: 'not_started',
  },
  progress_pct: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  due_date: {
    type: DataTypes.DATE,
  },
  completed_at: {
    type: DataTypes.DATE,
  },
}, {
  timestamps: true,
  tableName: 'user_progress',
});
