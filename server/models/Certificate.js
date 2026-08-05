import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  course_title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  issued_date: {
    type: DataTypes.STRING,
  },
  pdf_url: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
  tableName: 'certificates',
});
