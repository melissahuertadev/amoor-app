const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");

const path = require("path");
const flash = require("connect-flash");
const dotenv = require("dotenv").config();

const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const app = express();

/***************** Passport Config *****************/
require("./config/passport")(passport);

/***************** Mongoose *****************/
const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
});

/**, {
  
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
} */

/***************** Middleware *****************/
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({ replaceWith: "_" }));

app.set("port", process.env.PORT || 3000);

/***************** Express Session *****************/
const sessionConfig = {
  name: "amoorssessionid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

/************* Passport Middleware *************/
app.use(passport.initialize());
app.use(passport.session());

/**************** Global Vars *****************/
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.info_msg = req.flash("info_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

/******************* Routes *******************/
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

/* app.use((req, res) => {
  res.status(404).render("404");
}); */

/*************** Starting Server ***************/
app.listen(app.get("port"), () => {
  console.log("Server started on port ", app.get("port"));
});
