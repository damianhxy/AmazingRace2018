var express = require("express");
var router = express.Router();

var user = require("../models/user.js");
var problem = require("../models/problem.js");

var auth = require("../middlewares/auth.js");

router.get("/", function(req, res) {
    if (!req.user) {
        req.session.error = "Sign in first.";
        res.status(401).redirect("/signin");
    } else {
        res.render("submit", {
            title: "Submit",
            user: req.user,
            problems: problem.all()
        });
    }
});

router.post("/", auth, function(req, res) {
    var question = req.body.question;
    var answer = req.body.answer.trim();

    var category = question.substr(0, 2);
    var id = question.substr(2);

    problem.check(category, id, answer)
    .then(function(score) {
        return user.solve(req.user._id, question, score);
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

module.exports = router;