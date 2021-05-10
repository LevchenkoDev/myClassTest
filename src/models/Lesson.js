const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_CONNECT);
// Models
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const LessonStudent = require('../models/LessonStudent');
const LessonTeacher = require('../models/LessonTeacher');

class Lesson extends Model {}

Lesson.init({
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  underscored: true,
  timestamps: false,
  sequelize,
  tableName: 'lessons',
  modelName: 'Lesson'
});

Lesson.belongsToMany(Student, { as: 'students', through: LessonStudent });
Lesson.belongsToMany(Teacher, { as: 'teachers',  through: LessonTeacher });

module.exports = Lesson;