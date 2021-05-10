const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_CONNECT);

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