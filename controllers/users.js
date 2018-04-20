var express = require("express");
var passport = require("passport");
var router = express.Router();
var user = require("../models/user.js");
var auth = require("../middlewares/auth.js");

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
    res.render("profile", {
        title: "Profile",
        user: req.user
    })
});

module.exports = router;