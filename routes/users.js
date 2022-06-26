const express = require("express");
const router = express.Router();
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const User = require("../models/User");

/***************** Accesible Views *****************/
/* The following views don't need authentication:
 * Sign In, Sign Up            */
router.get("/signup", (req, res) => {
  res.render("signup");
});

router.get("/signin", (req, res) => {
  res.render("signin", { username: "", password: ""});
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
          res.render("settings", { amoors: foundUser.amoors });
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

router.get("/add", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("add");
  } else {
    req.flash("info_msg", "Oops! You need to be logged to add a new amoor");
    res.redirect("/home");
  }
});

router.get("/success", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("success");
  }
});

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
                    req.flash("success_msg", "You are now registered and logged in, you can add a new amoor.");
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
router.post("/signin", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      res.redirect("/users/signin");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/amoors");
      });
    }
  });
});

/*************** Add New Amoor ***************/
router.post("/add", function (req, res) {
  const submittedAmoor = req.body;

  function titleCase(string){
    return string[0].toUpperCase() + string.slice(1).toLowerCase();
  }

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
});

/*************** Delete an Amoor ***************/
router.post("/delete", function(req, res) {
  if (req.isAuthenticated()) {
    User.findById(req.user.id, function(err, foundUser){
      foundUser.amoors.splice(req.body.index, 1);
      foundUser.save(function(err){
        if(!err){
          res.redirect("/users/settings");
        }
      });
    });
  };
});

module.exports = router;
