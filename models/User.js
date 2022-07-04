const mongoose = require("mongoose");
const { Schema } = mongoose;
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

/* User Model */
const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  amoors: [{ type: Schema.Types.ObjectId, ref: 'Amoor', default: [] }],
  date: {
    type: Date,
    default: Date.now
  },
});

UserSchema.plugin(passportLocalMongoose, { usernameQueryFields: ["email"] });

const User = new mongoose.model("User", UserSchema);

module.exports = User;