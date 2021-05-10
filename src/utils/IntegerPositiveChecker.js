function integerPositiveChecker(number, valueName, canBeZero) {

  number = Number(number);

  if (isNaN(number)) {
    throw `${valueName} must be number`;
  }

  if (!canBeZero && number < 1) {
    throw `${valueName} must be more than 0`;
  }

  if ((number ^ 0) !== number) {
    throw `${valueName} must be integer`;
  }

}

module.exports = integerPositiveChecker;