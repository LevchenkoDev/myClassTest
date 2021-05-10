const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_CONNECT);
// Models
const Lesson = require('../models/Lesson');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
// Dal
const LessonTeacherDal = require('../dal/lessonTeachers');
// Utils
const dateChecker = require('../utils/dateChecker');
const integerPositiveChecker = require('../utils/IntegerPositiveChecker');
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
          attributes: {
            include: [[Sequelize.literal('"students->LessonStudent".visit'), 'visit']],
          },
          through: { attributes: [] },
        },
        {
          model: Teacher,
          as: 'teachers',
          through: { attributes: [] }
        }],
    };

    if (filter.lessonsPerPage) {

      integerPositiveChecker(filter.lessonsPerPage, 'lessonPerPage');
      queryOptions.limit = Number(filter.lessonsPerPage);

    } else {
      queryOptions.limit = 5;
    }

    if (filter.page) {

      integerPositiveChecker(filter.page, 'page');
      queryOptions.offset = (Number(filter.page) - 1) * queryOptions.limit;
    }

    const queryWhere = [];

    if (filter.teacherIds) {

      const teacherIds = filter.teacherIds.split(',').map(el => Number(el));
      teacherIds.map(el => { integerPositiveChecker(el, 'teacherId') });

      queryWhere.push(sequelize.where(sequelize.literal(`(SELECT array_agg(teacher_id::INTEGER) FROM lesson_teachers AS lesson_teachers WHERE
            lesson_teachers.lesson_id = id)`), '&&', teacherIds));
    }

    if (filter.studentsCount) {

      let comparisonSign = '=';
      let studentsCount = Number(filter.studentsCount);

      if (filter.studentsCount.length > 1) {
        comparisonSign = 'BETWEEN';
        studentsCount = filter.studentsCount.split(',').map(el => Number(el));
        studentsCount.map(el => { integerPositiveChecker(el, 'studentsCount', true) })
      } else {
        integerPositiveChecker(studentsCount, 'studentsCount', true);
      }

      queryWhere.push(sequelize.where(sequelize.literal(`(SELECT COUNT(*) FROM lesson_students AS lesson_students WHERE
            lesson_students.lesson_id = id)`), comparisonSign, studentsCount));
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

    if (filter.status) {

      if (isNaN(filter.status)) {
        throw 'Invalid status value';
      }

      queryWhere.push({ status: Number(filter.status) });
    }

    queryOptions.where = { [Op.and]: queryWhere };

    return await Lesson.findAll(queryOptions);
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
    } else {

      if (!Array.isArray(body.teacherIds)) {
        throw 'teacherIds must be array';
      }

      if (!body.teacherIds.length) {
        throw 'teacherIds can not be void';
      }

      for (let teacherId of body.teacherIds) {
        integerPositiveChecker(teacherId, 'teacherId');
      }
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

    try {
      await lessonTeacherDal.create(body.teacherIds, lessonIds);

    } catch (err) {

      await Lesson.destroy({ where: { id: lessonIds } });
      throw err;
    }

    return lessonIds;
  }

}

module.exports = LessonDal;
