const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_CONNECT);

class LessonStudent extends Model {}

LessonStudent.init({
  lesson_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  visit: {
    type: DataTypes.BOOLEAN,
  },
}, {
  sequelize,
  underscored: true,
  timestamps: false,
  tableName: 'lesson_students',
  modelName: 'LessonStudent'
});

module.exports = LessonStudent;