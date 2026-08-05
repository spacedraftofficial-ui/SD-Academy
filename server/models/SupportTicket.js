import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const SupportTicket = sequelize.define('SupportTicket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    defaultValue: 'IT Support',
  },
  description: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'pending_review', 'closed'),
    defaultValue: 'in_progress',
  },
  status_badge: {
    type: DataTypes.STRING,
    defaultValue: 'In Progress',
  },
  time_ago: {
    type: DataTypes.STRING,
    defaultValue: '1 Day ago',
  },
  assigned_agent: {
    type: DataTypes.STRING,
    defaultValue: 'Rachel',
  },
  assigned_role: {
    type: DataTypes.STRING,
    defaultValue: 'IT Support',
  },
  latest_comment: {
    type: DataTypes.TEXT,
    defaultValue: 'We are investigating the issue. Please wait while we resolve it.',
  },
}, {
  timestamps: true,
  tableName: 'support_tickets',
});
