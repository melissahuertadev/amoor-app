const { onlyLetters } = require("./utils.js");

//New user validation
function validateUser(newUser) {
  const { username, email, password, passwordConfirmation } = newUser;
  const errors = [];

  //Check required fields
  if (!username || !email || !password || !passwordConfirmation) {
    errors.push({ msg: "Please fill all fields." });
  }

  //Check passwords matching
  if (password !== passwordConfirmation) {
    errors.push({ msg: "Passwords do not match." });
  }

  //Check username length
  if (username.length < 3) {
    errors.push({ msg: "Username must contain 3 or more characters" });
  }

  //Check pass length
  if (password.length < 5) {
    errors.push({ msg: "Password must contain 5 or more characters" });
  }

  return errors;
}

//Update password validation
function validatePassword(upd) {
  const { password, passwordConfirmation } = upd;
  const errors = [];

  //Check required fields
  if (!password || !passwordConfirmation) {
    errors.push({ msg: "Please fill all fields." });
  }

  //Check passwords matching
  if (password !== passwordConfirmation) {
    errors.push({ msg: "Passwords do not match." });
  }

  //Check pass length
  if (password && password.length < 5) {
    errors.push({ msg: "Password must contain 5 or more characters" });
  }
  
  return errors;
}

let today = new Date();
today.setHours(0, 0, 0, 0);

//Amoor-item validation
function validateAmoor(amoorItem) {
  const { name1, name2, date, message } = amoorItem;
  const errors = [];

  if (!name1 || !name2 || !date || !message) {
    errors.push({ msg: "Please fill all fields." });
  }

  if (name1.length < 3 || name2.length < 3) {
    errors.push({ msg: "Names should contain more than 2 characters." });
  }

  if (!onlyLetters(name1) || !onlyLetters(name2)) {
    errors.push({ msg: "Names should contain only letters." });
  }

  if (date > today.toISOString().slice(0, 10)) {
    errors.push({ msg: "Insert a valid celebration date." });
  }

  return errors;
}

module.exports = { validateUser, validatePassword, validateAmoor };
