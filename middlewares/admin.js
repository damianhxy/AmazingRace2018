module.exports = function(req, res, next) {
    if (req.isAuthenticated() && req.user.admin)
        return next();
    res.status(401).redirect("/");
};
