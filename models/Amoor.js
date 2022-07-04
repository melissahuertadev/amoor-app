const mongoose = require("mongoose");

/* Amoor Model */
const AmoorSchema = new mongoose.Schema({
    name1: String,
    name2: String,
    date: String,
    message: String,
});

const Amoor = new mongoose.model("Amoor", AmoorSchema);

module.exports = Amoor;