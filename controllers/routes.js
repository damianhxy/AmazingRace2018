var express = require("express");
var router = express.Router();

var user = require("../models/user.js");
var admin = require("../middlewares/admin.js");

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
        user: req.user
    });
});

router.get("/register", function(req, res) {
    res.render("register", {
        title: "Register",
        user: req.user
    });
});

module.exports = router;