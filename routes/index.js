const express = require("express");
const router = express.Router();
/* const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose"); */

const User = require("../models/User");

/***************** Accesible Views *****************/
/* The following views don't need authentication:
 * Home, Sign In, Sign Up, Amoors' Wall, FAQ       */
router.get("/", (req, res) => {
  res.redirect("amoors");
});

router.get("/home", function (req, res) {
  res.render("home");
});

router.get("/amoors", function (req, res) {
  User.find({ amoors: { $ne: null } }, function (err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        if (req.isAuthenticated()) {
          res.render("amoors", { auth: "auth", usersWithAmoors: foundUsers });
        } else {
          res.render("amoors", {
            auth: "non-auth",
            usersWithAmoors: foundUsers,
          });
        }
      }
    }
  });
});

router.get("/faq", function (req, res) {
  res.render("faq");
});

module.exports = router;
