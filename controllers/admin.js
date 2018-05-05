var express = require("express");
var router = express.Router();

var problem = require("../models/problem.js");

router.get("/", function(req, res) {
    res.render("admin", {
        title: "Admin",
        user: req.user,
        problems: JSON.stringify(problem.all(), null, 4)
    });
});

router.post("/", function(req, res) {
    problem.update(req.body.data)
    .then(function() {
        req.session.success = "Problem(s) updated!";
        res.status(200).redirect("/admin");
    });
});

module.exports = router;