const { Router } = require('express');
const LessonDal = require('../dal/lessons')

const router = Router();
const lessonDal = new LessonDal();

router.post('/', async (req, res) => {

  try {
    const lessons = await lessonDal.find(req.body);
    res.status(200).json(lessons);

  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

router.post('/lessons', async (req, res) => {

  try {
    const result = await lessonDal.create(req.body);
    res.status(200).json(result);

  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

module.exports = router;