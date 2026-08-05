import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Material = sequelize.define('Material', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('sop', 'policy', 'checklist', 'template', 'form'),
    defaultValue: 'sop',
  },
  department: {
    type: DataTypes.STRING,
    defaultValue: 'Architecture',
  },
  phase: {
    type: DataTypes.STRING,
    defaultValue: 'Design Phase',
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: '📋',
  },
  file_url: {
    type: DataTypes.STRING,
  },
  version: {
    type: DataTypes.STRING,
    defaultValue: 'V1.4',
  },
  acknowledged_by: {
    type: DataTypes.TEXT, // Store array/JSON of user IDs
  },
}, {
  timestamps: true,
  tableName: 'materials',
});
