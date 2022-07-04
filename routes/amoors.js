const express = require("express");
const router = express.Router();
const methodOverride = require("method-override");

//const passport = require("passport");
//const passportLocalMongoose = require("passport-local-mongoose");
const { ensureAuthenticated } = require("../config/auth");

const { titleCase } = require("../js/utils");
const { validateAmoor } = require("../js/validation");

const User = require("../models/User");
const Amoor = require("../models/Amoor");

/****************** Auth Required Views ******************/
/* The following views NEED authentication:
 * Add News Amoor, Success Message, Settings, Logout */
router.get("/new", ensureAuthenticated, (req, res) => res.render("amoors/new"));

router.get("/success", ensureAuthenticated, (req, res) =>
  res.render("success")
);

router.get("/:id/edit", ensureAuthenticated, async (req, res) => {
  User.findById(req.user.id, function (err, foundUser) {
    let index = req.params.id;
    let amoorToEdit;

    foundUser.amoors.forEach(amoor => {
      if(index === amoor.id) {
        amoorToEdit = amoor;
      }
    });

    if (!err) {
      res.render("amoors/edit", {
        _id: req.params.id,
        name1: amoorToEdit.name1,
        name2: amoorToEdit.name2,
        date: amoorToEdit.date,
        message: amoorToEdit.message,
      });
    }
  });
});

/****************** Create a new Amoor ******************/
/* Add a New Amoor after passing validations:
 * - first and second field should not be empty, contain
 * at least 2 characters, contain only letters
 * - date can not be greater than current date
 * - message should not be empty and contain at least one
 * character.
 */
router.post("/new", async (req, res) => {
  const submittedAmoor = req.body;
  const { name1, name2, date, message } = req.body;
  let errors = [];

  errors = validateAmoor(submittedAmoor);
  
  if (errors.length > 0) {
    res.render("amoors/new", {
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
          const amoor = new Amoor({...submittedAmoor});
          foundUser.amoors.push(amoor);
          amoor.save();
          foundUser.save(function () {
            res.redirect("/amoors/success");
          });
        }
      }
    });
  }
});



module.exports = router;
