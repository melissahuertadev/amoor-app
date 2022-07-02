const express = require("express");
const router = express.Router();
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { ensureAuthenticated } = require("../config/auth");
const { titleCase, onlyLetters } = require("../js/utils");

const User = require("../models/User");

/***************** Accesible Views *****************/
/* The following views don't need authentication:
 * Sign In, Sign Up            */
router.get("/signup", (req, res) => {
  res.render("signup");
});

router.get("/signin", (req, res) => {
  res.render("signin");
});

/*************** Auth Required Views ***************/
/* The following views NEED authentication:
 * Add News Amoor, Success Message, Settings, Logout */

router.get("/settings", function (req, res) {
  User.findById(req.user.id, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (req.isAuthenticated()) {
          res.render("settings", {
            name: foundUser.username,
            amoors: foundUser.amoors,
          });
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
      req.flash("info_msg", "You've successfully logged out. See ya'");
      res.redirect("/home");
    }
  });
});

router.get("/add", ensureAuthenticated, (req, res) => res.render("add"));

router.get("/success", ensureAuthenticated, (req, res) =>
  res.render("success")
);

/*************** Authentication ***************/
//Sign Up
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
                  return res.redirect("/users/signup");
                } else {
                  passport.authenticate("local")(req, res, function () {
                    req.flash(
                      "success_msg",
                      "You are now registered and logged in, you can add a new amoor."
                    );
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

//Sign In
router.post(
  "/signin",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/users/signin",
  }),
  (req, res) => {
    req.flash("success_msg", "Welcome");
    const redirectUrl = req.session.returnTo || "/amoors";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

/*********** Create and Delete Amoor ***********/
/* Add a New Amoor after passing validations:
 * - first and second field should not be empty,
 * contain at least 2 characters, contain only
 * letters
 * - date can not be greater than current date
 * - message should not be empty and contain at
 * least one character.
 */
//Add
router.post("/add", function (req, res) {
  const submittedAmoor = req.body;
  let errors = [];
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!submittedAmoor.name1 || !submittedAmoor.name2 || !submittedAmoor.date || !submittedAmoor.message) {
    errors.push({ msg: "Please fill all fields." });
  }

  if (submittedAmoor.name1.length < 3 || submittedAmoor.name2.length < 3) {
    errors.push({ msg: "Names should contain more than 2 characters." });
  }

  if (!onlyLetters(submittedAmoor.name1) || !onlyLetters(submittedAmoor.name2)) {
    errors.push({ msg: "Names should contain only letters." });
  }

  if (submittedAmoor.date > today.toISOString().slice(0, 10)) {
    errors.push({ msg: "Insert a valid celebration date." });
  }
  

  if (errors.length > 0) {
    res.render("add", {
      errors,
      ...submittedAmoor,
    });
  } else {
    // Validation passed
    submittedAmoor.name1 = titleCase(submittedAmoor.name1);
    submittedAmoor.name2 = titleCase(submittedAmoor.name2);

    User.findById(req.user.id, function (err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          foundUser.amoors.push(submittedAmoor);
          foundUser.save(function () {
            res.redirect("/users/success");
          });
        }
      }
    });
  }
});

//Delete
router.post("/delete", function (req, res) {
  if (req.isAuthenticated()) {
    User.findById(req.user.id, function (err, foundUser) {
      foundUser.amoors.splice(req.body.index, 1);
      foundUser.save(function (err) {
        if (!err) {
          res.redirect("/users/settings");
        }
      });
    });
  }
});

module.exports = router;
