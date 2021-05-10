const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_CONNECT);

class Teacher extends Model {}

Teacher.init({
  name: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
}, {
  underscored: true,
  timestamps: false,
  sequelize,
  tableName: 'teachers',
  modelName: 'Teacher'
});

module.exports = Teacher;