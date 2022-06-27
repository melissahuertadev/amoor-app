const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");

const path = require("path");
const flash = require('connect-flash');
const dotenv = require('dotenv').config();

const app = express();

/***************** Passport Config *****************/
require("./config/passport")(passport);

/***************** Mongoose *****************/
mongoose.connect("mongodb://localhost:27017/amoorDB");

/***************** Middleware *****************/

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("port", process.env.PORT || 3000);

/***************** Express Session *****************/
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 *24 * 7,
      maxAge: 1000 * 60 * 60 *24 * 7,
    }
  })
);

/************* Passport Middleware *************/
app.use(passport.initialize());
app.use(passport.session());


/********* Connect flash + Global Vars *********/
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.info_msg = req.flash('info_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

/******************* Routes *******************/
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

/*************** Starting Server ***************/
app.listen(app.get("port"), () => {
  console.log("Server started on port ", app.get("port"));
});
