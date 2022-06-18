const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function(req, res){
    res.render("home");
});

app.get("/signin", function(req, res){
    res.render("signin");
});

app.get("/signup", function(req, res){
    res.render("signup");
});

app.get("/faq", function(req, res){
    res.render("faq");
});




app.listen(3000, function(){
    console.log("Server started on port 3000.");
});