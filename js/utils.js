//Capitalize string's first letter
function titleCase(str) {
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

//Check if a string contains only letters
function onlyLetters(str) {
  return /^[a-zA-Z]+$/.test(str);
}

//Check if a string contains only letters
function isCelebrationDay(date) {
  const today = new Date();

  return (
    parseInt(date.substring(8, 10)) == today.getDate() &&
    parseInt(date.substring(5, 7)) == today.getMonth() + 1
  );
}

module.exports = { titleCase, onlyLetters, isCelebrationDay };
