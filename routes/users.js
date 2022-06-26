const express = require("express");
const router = express.Router();
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const User = require("../models/User");

/***************** Accesible Views *****************/
/* The following views don't need authentication:
 * Sign In, Sign Up            */
router.get("/signin", (req, res) => {
  res.render("signin", { username: "", password: "", errMsg: "" });
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

/*************** Sign Up ***************/
router.post("/signup", function (req, res) {
  const { username, email, password, passwordConfirmation } = req.body;
  let errors = [];

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

  if (errors.length > 0) {
    res.render("signup", {
      errors,
      username,
      email,
      password,
      passwordConfirmation,
    });
  } else {
    // Validation passed
    User.findOne({ email: email }).then((user) => {
      if (user) {
        //E-mail exists
        errors.push({ msg: "E-mail is already registered" });
        res.render("signup", {
          errors,
          username,
          email,
          password,
          passwordConfirmation,
        });
      } else {
        User.findOne({ username: username }).then((user) => {
          if (user) {
            //Username exists
            errors.push({ msg: "Username is already registered" });
            res.render("signup", {
              errors,
              username,
              email,
              password,
              passwordConfirmation,
            });
          } else {
            User.register(
              { username: req.body.username, email: req.body.email },
              req.body.password,
              function (err, user) {
                if (err) {
                  console.log(err);
                  return res.redirect("/users/signup");
                } else {
                  passport.authenticate("local")(req, res, function () {
                    res.redirect("/amoors");
                  });
                }
              }
            );
          }
        });
      }
    });
  }
});

/*************** Auth Required Views ***************/
/* The following views NEED authentication:
 * Add News Amoor, Success Message, Settings       */
router.get("/settings", function (req, res) {
    User.findById(req.user.id, (err, foundUser) => {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          if (req.isAuthenticated()) {
            res.render("settings", {amoors: foundUser.amoors});
          }
        }
      }
    });  
  });

router.get("/logout", function (req, res) {
  req.logout((err) => {
    if (err) {
      console.log(err);
    } else {
      res.render("home", {
        message: "You've successfully logged out. See ya'",
      });
    }
  });
});

module.exports = router;