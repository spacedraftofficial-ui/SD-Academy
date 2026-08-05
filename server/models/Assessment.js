import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Assessment = sequelize.define('Assessment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  module_id: {
    type: DataTypes.INTEGER,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('quiz', 'assignment'),
    defaultValue: 'quiz',
  },
  status_label: {
    type: DataTypes.STRING,
    defaultValue: 'Not Started',
  },
  questions_json: {
    type: DataTypes.TEXT, // Store JSON string of questions & options
  },
}, {
  timestamps: true,
  tableName: 'assessments',
});
