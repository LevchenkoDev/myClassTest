// Models
const LessonTeacher = require('../models/LessonTeacher')

class LessonTeacherDal {

  async create(teacherIds, lessonIds) {

    const lessonTeachers = [];

    for (let teacherId of teacherIds)
      for (let lessonId of lessonIds) {
        const lessonTeacher = {
          LessonId: lessonId,
          TeacherId: teacherId
        };

        lessonTeachers.push(lessonTeacher);
      }
    await LessonTeacher.bulkCreate(lessonTeachers);

    return true;
  }
}

module.exports = LessonTeacherDal;