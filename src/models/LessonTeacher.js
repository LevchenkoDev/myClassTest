const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:admin@localhost:5432/myclass');

class LessonTeacher extends Model {}

LessonTeacher.init({
  lesson_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false,
  underscored: true,
  sequelize,
  tableName: 'lesson_teachers',
  modelName: 'LessonTeacher'
});

module.exports = LessonTeacher;