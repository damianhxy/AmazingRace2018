module.exports = function (req, res, next) {
  for (const key of ["success", "error"]) {
    if (req.session[key]) {
      res.locals[key] = req.session[key];
      delete req.session[key];
    }
  }
  next();
};
