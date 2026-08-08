import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const VideoNote = sequelize.define('VideoNote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  timestamp_sec: {
    type: DataTypes.STRING,
    defaultValue: '05:18',
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_mine: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_bookmarked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  tableName: 'video_notes',
});
