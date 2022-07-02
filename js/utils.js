//Capitalize string's first letter
function titleCase(str) {
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

//Check if a string contains only letters
function onlyLetters(str) {
    return /^[a-zA-Z]+$/.test(str);
}

module.exports = {titleCase, onlyLetters}