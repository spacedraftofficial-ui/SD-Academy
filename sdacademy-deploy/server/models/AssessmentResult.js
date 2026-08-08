import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const AssessmentResult = sequelize.define('AssessmentResult', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assessment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('attempted', 'passed', 'failed', 'needs_review'),
    defaultValue: 'attempted',
  },
  answers_json: {
    type: DataTypes.TEXT,
  },
  submitted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  tableName: 'assessment_results',
});
