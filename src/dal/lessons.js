const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_CONNECT);
// Models
const Lesson = require('../models/Lesson');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const LessonStudent = require('../models/LessonStudent');
const LessonTeacher = require('../models/LessonTeacher');
// Dal
const LessonTeacherDal = require('../dal/lessonTeachers');
// Utils
const dateChecker = require('../utils/dateChecker');
const date_fns = require('date-fns');


const Op = Sequelize.Op;
const lessonTeacherDal = new LessonTeacherDal();

class LessonDal {

  async find(filter) {

    const queryOptions = {
      attributes: ['id', 'date', 'title', 'status',
        [sequelize.literal(`(SELECT COUNT(*) FROM lesson_students  AS lesson_students  WHERE 
            lesson_students.lesson_id = id AND lesson_students.visit = true)`), 'visitCount']],
      include: [
        {
          model: Student,
          as: 'students',
          through: { attributes: ['visit'] },
        },
        {
          model: Teacher,
          as: 'teachers',
          through: { attributes: [] }
        }],
    };

    queryOptions.limit = filter.lessonsPerPage || 5;

    if (filter.page) {
      queryOptions.offset = (filter.page - 1) * queryOptions.limit;
    }

    if (filter.teacherIds) {
      queryOptions.include[1].where = {id: {[Op.in]: filter.teacherIds}};
    }

    const queryWhere = [];

    if (filter.studentsCount !== null && filter.studentsCount !== undefined) { /* 0 is possible value */
      const comparisonSign = typeof filter.studentsCount === 'number' ? '=' : 'BETWEEN';

      queryWhere.push(sequelize.where(sequelize.literal(`(SELECT COUNT(*) FROM lesson_students AS lesson_students WHERE
            lesson_students.lesson_id = id)`), comparisonSign, filter.studentsCount));
    }

    // Parsing date in filter
    if (filter.date) {

      if (filter.date.length === 10) /* One date */ {
        dateChecker(filter.date);
        queryWhere.push({ date: filter.date });

      } else if (filter.date.length === 21) /* Two dates */ {
        const date1 = filter.date.slice(0, 10);
        const date2 = filter.date.slice(11);

        dateChecker(date1);
        dateChecker(date2);

        if (date1 > date2) {
          throw 'Invalid date format';
        }

        queryWhere.push({ date: { [Op.between]: [date1, date2] } })

      } else {
        throw 'Invalid date format';
      }
    }

    if (filter.status !== null && filter.status !== undefined) { /* 0 is possible value */
      queryWhere.push({ status: Number(filter.status) });
    }

    queryOptions.where = { [Op.and]: queryWhere };

    const lessons = await Lesson.findAll(queryOptions);

    return lessons.map(el => el.dataValues);
  }

  async create(body) {

    const lessons = [];

    if (!body.firstDate) {
      throw 'firstDate is required';
    }
    dateChecker(body.firstDate);

    if (body.lastDate) {
      dateChecker(body.lastDate);
    }

    if (!(body.lessonsCount || body.lastDate)) {
      throw 'One of arguments lessonsCount or lastDate must be in request body';
    }

    if (body.lessonsCount && body.lastDate) {
      throw 'In request must be only one of lessonsCount or lastDate'
    }

    if (!body.teacherIds) {
      throw 'teacherIds is required';
    }

    let idCount = await Lesson.max('id');
    let currentDate = date_fns.parseISO(body.firstDate);
    let count = 0;

    // Making array of lessons
    while (body.lessonsCount && count < body.lessonsCount || body.lastDate && currentDate < date_fns.parseISO(body.lastDate)) {

      if (body.days.includes(date_fns.getDay(currentDate))) { /* If current date is in the days */

        const lesson = {
          id: ++idCount,
          title: body.title,
          date: currentDate,
        };

        lessons.push(lesson);
        count++;
      }

      currentDate = date_fns.add(currentDate, {days: 1});

      const dateDifferent = Math.abs(currentDate - date_fns.parseISO(body.firstDate));

      if (count === 300 || dateDifferent >= (86400000 * 365)/* 1 year */) {
        break;
      }
    }
    const lessonIds = lessons.map(el => el.id);

    await Lesson.bulkCreate(lessons);
    await lessonTeacherDal.create(body.teacherIds, lessonIds);

    return lessonIds;
  }

}

module.exports = LessonDal;
