const express = require("express");
const router = express.Router();

const user = require("../models/user.js");

const flash = require("../middlewares/flash.js");

router.use(flash);

router.get("/", function (req, res) {
  res.render("home", {
    title: "Home",
    user: req.user,
  });
});

/* Users */
router.use("/users", require("./users.js"));

router.get("/leaderboard", async function (req, res, next) {
  try {
    const leaderboard = await user.leaderboard();
    res.render("leaderboard", {
      title: "Leaderboard",
      user: req.user,
      leaderboard: leaderboard,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/signin", function (req, res) {
  res.render("signin", {
    title: "Sign In",
  });
});

router.use("/submit", require("./submit.js"));

router.use("/admin", require("./admin.js"));

router.get("/register", function (req, res) {
  res.render("register", {
    title: "Register",
    user: req.user,
  });
});

/* 404 & 500 */
router.use(function (req, res) {
  res.status(404).render("404", {
    title: "Page Not Found",
    user: req.user,
  });
});

router.use(function (err, req, res, _next) {
  console.error(err.stack);
  res.status(500).render("500", {
    title: "Internal Server Error",
    user: req.user,
    error: req.app.get("env") === "production" ? undefined : err.message,
  });
});

module.exports = router;
