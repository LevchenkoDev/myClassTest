function dateChecker(dateString) {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;

  if(!dateString.match(regEx)) {
    throw 'Invalid date format';
  }

  const d = new Date(dateString);
  const dNum = d.getTime();

  if(!dNum && dNum !== 0) {
    throw 'Invalid date format';
  }

  if (!(d.toISOString().slice(0,10) === dateString)) {
    throw 'Invalid date format';
  }
}

module.exports = dateChecker;