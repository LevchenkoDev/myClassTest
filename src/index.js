const express = require('express');
const { Sequelize } = require('sequelize');
const lessonRouter = require('./routes/lessons');
const bodyParser = require('body-parser');

const PORT = 3000;

const sequelize = new Sequelize('postgres://postgres:admin@localhost:5432/myclass');
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