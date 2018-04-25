var express = require("express");
var router = express.Router();

var user = require("../models/user.js");
var problem = require("../models/problem.js");

var flash = require("../middlewares/flash.js");
var admin = require("../middlewares/admin.js");

router.use(flash);

router.get("/", function(req, res) {
    res.render("home", {
        title: "Home",
        user: req.user
    });
});

/* Users */
router.use("/users", require("./users.js"));

router.get("/leaderboard", function(req, res) {
    user.leaderboard()
    .then(function(leaderboard) {
        res.render("leaderboard", {
            title: "Leaderboard",
            user: req.user,
            leaderboard: leaderboard
        });
    });
});

router.get("/submit", function(req, res) {
    res.render("submit", {
        title: "Submit",
        user: req.user,
        problems: problem.all()
    });
});

router.post("/submit", function(req, res) {
    var question = req.body.question;
    var answer = req.body.answer;

    var questionParts = question.split("-")
    var category = questionParts[0]
    var id = questionParts[1]

    problem.check(category, id, answer)
    .then(function(score) {
        return user.solve(req.user.username, question, score);
    })
    .then(function() {
        req.session.success = question + " solved!";
        res.redirect("/submit");
    })
    .catch(function(err) {
        req.session.error = err.message;
        res.redirect("/submit");
    });
});

router.get("/register", function(req, res) {
    res.render("register", {
        title: "Register",
        user: req.user
    });
});

module.exports = router;