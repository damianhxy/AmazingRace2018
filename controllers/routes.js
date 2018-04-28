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
        res.status(200).redirect("/submit");
    })
    .catch(function(err) {
        req.session.error = err.message;
        res.status(400).redirect("/submit");
    });
});

router.get("/admin", admin, function(req, res) {
    res.render("admin", {
        title: "Admin",
        user: req.user,
        problems: JSON.stringify(problem.all(), null, 4)
    });
});

router.post("/admin", admin, function(req, res) {
    problem.update(req.body.data)
    .then(function() {
        req.session.success = "Problem(s) updated!";
        res.status(200).redirect("/admin");
    });
});

router.get("/register", function(req, res) {
    res.render("register", {
        title: "Register",
        user: req.user
    });
});

/* 404 & 500 */
router.use(function(req, res) {
    res.status(404).render("404", {
        title: "Page Not Found",
        user: req.user
    });
});

router.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).render("500", {
        title: "Internal Server Error",
        user: req.user
    });
});

module.exports = router;