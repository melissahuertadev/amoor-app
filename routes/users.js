const express = require("express");
const router = express.Router();
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { ensureAuthenticated } = require("../config/auth");
const { titleCase, onlyLetters } = require("../js/utils");
const { validateUser, validateAmoor } = require("../js/validation");

const User = require("../models/User");
const Amoor = require("../models/Amoor");

/***************** Accesible Views *****************/
/* The following views don't need authentication:
 * Sign In, Sign Up            */
//Sign Up
router.get("/signup", (req, res) => {
  res.render("users/signup");
});

//Sign In
router.get("/signin", (req, res) => {
  res.render("users/signin");
});

//Forgot Password?
router.get("/forgot-password", function(req, res){

});

router.post("/forgot-password", function(req, res){

});

/*************** Auth Required Views ***************/
/* The following views NEED authentication:
 * Add News Amoor, Success Message, Settings, Logout */

router.get("/settings", async function (req, res) {
  try {
    const user = await User.findById(req.user.id).populate('amoors');

    if(!user){
      return res.status(400);
    } else {
      res.render("users/settings", { user });
    }
  } catch(err){
    console.log(err);
  }
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
    res.render("users/signup", {
      errors,
      ...submittedUser,
    });
  } else {
    // Validation passed
    User.findOne({ email: submittedUser.email }).then((user) => {
      if (user) {
        //E-mail exists
        errors.push({ msg: "E-mail is already registered" });
        res.render("users/signup", {
          errors,
          ...submittedUser,
        });
      } else {
        User.findOne({ username: submittedUser.username }).then((user) => {
          if (user) {
            //Username exists
            errors.push({ msg: "Username is already registered" });
            res.render("users/signup", {
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


/*********** Account Settings ***********/
//Update Password

router.get("/reset-password", function(req, res){

});

router.post("/reset-password", function(req, res){

});

//Delete Account
router.get("/:id/delete", ensureAuthenticated, async (req, res) => {
  const id = req.params.id;

  User.findById(id, function (err, foundUser) {
    if (!err) {
      res.render("users/delete", {
        _id: id,
      });
    }
  });
});


router.delete("/:id", async function(req, res){
  const { id } = req.params;
  const { email } = req.body;

  User.findById(id, async function(err, foundUser){
    if(!err) {
      if(email === foundUser.email || email === foundUser.username){
        //Remove User's amoors
        if (foundUser.amoors.length){
          const res = await Amoor.deleteMany({_id: { $in: foundUser.amoors}});
        }
        //Remove User
        foundUser.remove();
        req.flash('success_msg', 'Your account was successfully deleted');
        res.redirect('/amoors');
      } else {
        req.flash('error', 'Username or e-mail does not match.');
        res.redirect(`/users/${id}/delete`);
      }
    }
  });
});

module.exports = router;
