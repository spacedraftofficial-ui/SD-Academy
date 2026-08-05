import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Module = sequelize.define('Module', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('video', 'sop', 'assessment'),
    defaultValue: 'video',
  },
  content_url: {
    type: DataTypes.STRING,
  },
  duration: {
    type: DataTypes.STRING,
    defaultValue: '23:45',
  },
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  timestamps: true,
  tableName: 'modules',
});
