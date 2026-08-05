import { sequelize } from '../config/database.js';
import { User } from './User.js';
import { Course } from './Course.js';
import { Module } from './Module.js';
import { UserProgress } from './UserProgress.js';
import { Assessment } from './Assessment.js';
import { AssessmentResult } from './AssessmentResult.js';
import { Material } from './Material.js';
import { Certificate } from './Certificate.js';
import { Announcement } from './Announcement.js';
import { SupportTicket } from './SupportTicket.js';
import { VideoNote } from './VideoNote.js';

// Setup Model Relationships
Course.hasMany(Module, { foreignKey: 'course_id' });
Module.belongsTo(Course, { foreignKey: 'course_id' });

User.hasMany(UserProgress, { foreignKey: 'user_id' });
UserProgress.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(AssessmentResult, { foreignKey: 'user_id' });
AssessmentResult.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Certificate, { foreignKey: 'user_id' });
Certificate.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(SupportTicket, { foreignKey: 'user_id' });
SupportTicket.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(VideoNote, { foreignKey: 'user_id' });
VideoNote.belongsTo(User, { foreignKey: 'user_id' });

export {
  sequelize,
  User,
  Course,
  Module,
  UserProgress,
  Assessment,
  AssessmentResult,
  Material,
  Certificate,
  Announcement,
  SupportTicket,
  VideoNote,
};
