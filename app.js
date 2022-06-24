const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

/***************** Express Session *****************/
app.use(
  session({
    secret: "melimeli",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

/***************** Mongoose *****************/
mongoose.connect("mongodb://localhost:27017/amoorDB");

/* User Model */
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  amoors: [{type: Object}],
});

userSchema.plugin(passportLocalMongoose, { usernameQueryFields: ["email"] });

const User = new mongoose.model("User", userSchema);

/* Passport-Local Configuration */
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/***************** Accesible Views *****************/
/* The following views don't need authentication:
 * Home, Sign In, Sign Up, Amoors' Wall            */
app.get("/", function (req, res) {
  res.render("home");
});

app.get("/signin", function (req, res) {
  res.render("signin", { username: "", password: "", errMsg: "" });
});

app.get("/signup", function (req, res) {
  res.render("signup");
});

app.get("/amoors", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("amoors", { auth: "auth" });
  } else {
    res.render("amoors", { auth: "non-auth" });
  }
});

app.get("/faq", function (req, res) {
  res.render("faq");
});

app.get("/logout", function (req, res) {
  req.logout((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

/*************** Auth Required Views ***************/
/* The following views NEED authentication:
 * Add News Amoor, Success Message, Settings       */
app.get("/settings", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("settings");
  }
});

app.get("/add", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("add");
  } else {
    //TODO: add message "you need to be logged to add a new amoor"
    res.redirect("/");
  }
});

app.get("/success", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("success");
  }
});

/*************** Add New Amoor ***************/
app.post("/add", function(req, res){
  const submittedAmoor = req.body;

  User.findById(req.user.id, function(err, foundUser){
    if(err){
      console.log(err);
    } else {
      if(foundUser){
        foundUser.amoors.push(submittedAmoor);
        foundUser.save(function() {
          res.redirect("/success");
        });
      }
    }
  });
});

/*************** Sign Up ***************/
app.post("/signup", function (req, res) {
  User.register(
    { username: req.body.username, email: req.body.email },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        return res.redirect("/signup"); //with error
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/amoors"); //with cookie?
        });
      }
    }
  );
});

/*************** Sign In ***************/
app.post("/signin", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
      res.redirect("/signin");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/amoors");
      });
    }
  });
});

/*************** Starting Server ***************/
app.listen(3000, function () {
  console.log("Server started on port 3000.");
});
