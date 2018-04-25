var express = require("express");
var passport = require("passport");
var router = express.Router();

var user = require("../models/user.js");

var auth = require("../middlewares/auth.js");
var admin = require("../middlewares/admin.js");

router.post("/signin", passport.authenticate("local-signin", {
    successRedirect: "/",
    failureRedirect: "/submit"
}));

router.post("/signup", passport.authenticate("local-signup", {
    successRedirect: "/",
    failureRedirect: "/register"
}));

router.get("/signout", auth, function(req, res) {
   req.logout();
   res.redirect("/");
});

router.get("/:username", function(req, res) {
    user.get(req.params.username)
    .then(function(userData) {
        res.render("profile", {
            title: "Profile",
            user: req.user,
            data: userData
        });
    });
});

router.delete("/:username", admin, function(req, res) {
    user.delete(req.params.username)
    .then(function() {
        req.session.success = "User Deleted!";
        res.redirect("/leaderboard");
    })
    .catch(function(err) {
        req.session.error = err.message;
        res.redirect("/leaderboard");
    });
});

module.exports = router;