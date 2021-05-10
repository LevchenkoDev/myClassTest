require('dotenv').config();

const express = require('express');
const { Sequelize } = require('sequelize');
const lessonRouter = require('./routes/lessons');
const bodyParser = require('body-parser');

const PORT = 3000;

const sequelize = new Sequelize(process.env.DB_CONNECT);
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(lessonRouter);

async function start() {
  try {
    await sequelize.authenticate();

    app.listen(PORT, () =>{
      console.log(`Server has been started on port ${PORT}...`)
    });
  } catch (err) {
    console.log(err)
  }
}

start();