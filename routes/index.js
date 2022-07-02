const express = require("express");
const router = express.Router();

const { isCelebrationDay } = require("../js/utils");
const User = require("../models/User");

/***************** Accesible Views *****************/
/* The following views don't need authentication:
 * Home, Amoors' Wall, FAQ                         */
router.get("/", (req, res) => {
  res.redirect("amoors");
});

router.get("/home", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("home", { auth: "auth" });
  } else {
    res.render("home", { auth: "non-auth" });
  }
});

router.get("/amoors", function (req, res) {
  User.find({ amoors: { $ne: null } }, function (err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        if (req.isAuthenticated()) {
          res.render("amoors", { auth: "auth", usersWithAmoors: foundUsers, isCelebrationDay: isCelebrationDay });
        } else {
          res.render("amoors", {
            auth: "non-auth",
            usersWithAmoors: foundUsers, isCelebrationDay: isCelebrationDay
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
