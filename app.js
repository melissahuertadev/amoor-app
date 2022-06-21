const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB");

/* UsersDB */
const userSchema = {
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
};

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/signin", function (req, res) {
  res.render("signin", { email: "", password: "", errMsg: "" });
});

app.get("/signup", function (req, res) {
  res.render("signup");
});

app.get("/faq", function (req, res) {
  res.render("faq");
});

/* Sign Up */
app.post("/signup", function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hash,
    });

    /* TO DO: password-confirmation validation " */
    newUser.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.render("amoors");
      }
    });
  });
});

/* Sign In */
app.post("/signin", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function (error, result) {
          if (result === true) {
            res.render("amoors");
            console.log("New login (" + email + ")");
          } else {
            res.render("signin", {
              email: email,
              password: "",
              errMsg: "Email or password incorrect.",
            });
          }
        });
      } else {
        res.render("signin", {
          email: email,
          password: "",
          errMsg: "No matching user found",
        });
      }
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000.");
});
