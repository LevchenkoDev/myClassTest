const { Router } = require('express');
const LessonDal = require('../dal/lessons')

const router = Router();
const lessonDal = new LessonDal();

router.get('/', async (req, res) => {

  try {

    const filter = {
      date: req.query.date,
      status: req.query.status,
      teacherIds: req.query.teacherIds,
      studentsCount: req.query.studentsCount,
      page: req.query.page,
      lessonsPerPage: req.query.lessonsPerPage,
    }

    const lessons = await lessonDal.find(filter);
    res.status(200).json(lessons);

  } catch (err) {
    console.log('ERROR:', err);
    res.status(400).send(err);
  }
});

router.post('/lessons', async (req, res) => {

  try {
    const result = await lessonDal.create(req.body);
    res.status(200).json(result);

  } catch (err) {
    console.log('ERROR:', err);
    res.status(400).send(err);
  }
});

module.exports = router;