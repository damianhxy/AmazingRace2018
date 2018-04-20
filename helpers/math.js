module.exports = function(lval, op, rval) {
    lval = parseFloat(lval);
    rval = parseFloat(rval);
    return {
        "+": lval + rval,
        "-": lval - rval,
        "*": lval * rval,
        "/": lval / rval,
        "%": lval % rval
    }[op];
};