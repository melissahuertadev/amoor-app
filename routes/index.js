const express = require("express");
const router = express.Router();

const { isCelebrationDay } = require("../js/utils");
const User = require("../models/User");
const Amoor = require("../models/Amoor");

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
  Amoor.find({ $ne: null }, function (err, foundAmoors) {
    if (err) {
      console.log(err);
    } else {
      if (foundAmoors) {
        if (req.isAuthenticated()) {
          res.render("amoors", { auth: "auth", userId: req.user.id, amoors: foundAmoors, isCelebrationDay: isCelebrationDay });
        } else {
          res.render("amoors", {
            auth: "non-auth", userId: "",
            amoors: foundAmoors, isCelebrationDay: isCelebrationDay
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
