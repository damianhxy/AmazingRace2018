module.exports = function (lval, op, rval) {
  lval = parseFloat(lval);
  rval = parseFloat(rval);
  const result = {
    "+": lval + rval,
    "-": lval - rval,
    "*": lval * rval,
    "/": lval / rval,
    "%": lval % rval,
  }[op];
  return result !== undefined ? result : 0;
};
