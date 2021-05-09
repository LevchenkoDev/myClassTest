const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:admin@localhost:5432/myclass');

class Student extends Model {}

Student.init({
  name: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
}, {
  underscored: true,
  timestamps: false,
  sequelize,
  tableName: 'students',
  modelName: 'Student'
});

module.exports = Student;