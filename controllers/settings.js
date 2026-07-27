require("dotenv").config();

exports.PORT = process.env.PORT || 5000;
exports.SECRET = process.env.SESSION_SECRET;
exports.HASH_ROUNDS = 10;
