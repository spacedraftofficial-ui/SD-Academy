import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Announcement = sequelize.define('Announcement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    defaultValue: 'Laura HR',
  },
  category: {
    type: DataTypes.ENUM('all', 'hr', 'projects', 'it'),
    defaultValue: 'hr',
  },
  tag: {
    type: DataTypes.STRING,
    defaultValue: 'HR Announcement',
  },
  tag_cls: {
    type: DataTypes.STRING,
    defaultValue: 'badge-navy',
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  likes_count: {
    type: DataTypes.INTEGER,
    defaultValue: 45,
  },
  comments_count: {
    type: DataTypes.INTEGER,
    defaultValue: 12,
  },
}, {
  timestamps: true,
  tableName: 'announcements',
});
