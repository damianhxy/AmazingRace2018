var express = require("express");
var passport = require("passport");
var router = express.Router();

var user = require("../models/user.js");
var problem = require("../models/problem.js");

var auth = require("../middlewares/auth.js");
var admin = require("../middlewares/admin.js");

router.get("/profile", auth, function(req, res) {
    res.render("profile", {
        title: "Profile",
        user: req.user,
        data: req.user
    });
});

router.get("/profile/:id", admin, function(req, res) {
    user.get(req.params.id)
    .then(function(userData) {
        res.render("profile", {
            title: "Profile",
            user: req.user,
            data: userData
        });
    });
});

router.put("/:id", admin, function(req, res) {
    user.clear(req.params.id)
    .then(function() {
        req.session.success = "Problems Cleared!";
        res.status(200).redirect("/users/profile/" + req.params.id);
    })
    .catch(function(err) {
        req.session.error = err.message;
        res.status(400).redirect("/users/profile/" + req.params.ide)
    });
});

router.delete("/:id", admin, function(req, res) {
    user.delete(req.params.id)
    .then(function() {
        req.session.success = "User Deleted!";
        res.status(200).redirect("/leaderboard");
    })
    .catch(function(err) {
        req.session.error = err.message;
        res.status(400).redirect("/leaderboard");
    });
});

router.post("/signin", passport.authenticate("local-signin", {
    successRedirect: "/",
    failureRedirect: "/signin"
}));

router.post("/signup", passport.authenticate("local-signup", {
    successRedirect: "/",
    failureRedirect: "/register"
}));

router.get("/signout", auth, function(req, res) {
   req.logout();
   res.redirect("/");
});

module.exports = router;