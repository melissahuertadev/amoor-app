const express = require("express");
const router = express.Router();
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { ensureAuthenticated } = require("../config/auth");
const { titleCase, onlyLetters } = require("../js/utils");
const { validateUser, validateAmoor } = require("../js/validation");

const User = require("../models/User");

/***************** Accesible Views *****************/
/* The following views don't need authentication:
 * Sign In, Sign Up            */
router.get("/signup", (req, res) => {
  res.render("users/signup");
});

router.get("/signin", (req, res) => {
  res.render("users/signin");
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
          console.log(foundUser);
          console.log(foundUser.amoors);
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

router.get("/success", ensureAuthenticated, (req, res) =>
  res.render("success")
);

/*************** Authentication ***************/
//Sign Up
router.post("/signup", function (req, res) {
  const submittedUser = req.body;
  let errors = [];

  errors = validateUser(submittedUser);

  if (errors.length > 0) {
    res.render("signup", {
      errors,
      ...submittedUser,
    });
  } else {
    // Validation passed
    User.findOne({ email: submittedUser.email }).then((user) => {
      if (user) {
        //E-mail exists
        errors.push({ msg: "E-mail is already registered" });
        res.render("signup", {
          errors,
          ...submittedUser,
        });
      } else {
        User.findOne({ username: submittedUser.username }).then((user) => {
          if (user) {
            //Username exists
            errors.push({ msg: "Username is already registered" });
            res.render("signup", {
              errors,
              ...submittedUser,
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
//Create
router.get("/:id/amoors/new", function (req, res) {

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
