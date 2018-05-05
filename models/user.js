var settings = require("../controllers/settings.js");

var Promise = require("bluebird");
var nedb = require("nedb");
var bcryptjs = require("bcryptjs");
var users = new nedb({ filename: "./database/users", autoload: true });
Promise.promisifyAll(users);
Promise.promisifyAll(users.find().constructor.prototype);

Promise.promisifyAll(bcryptjs);

exports.add = function(req, username, password) {
    username = username.trim();
    return users.findOneAsync({ username: username })
    .then(function(user) {
        if (user) throw Error("User already exists");
        return bcryptjs.hashAsync(password, settings.HASH_ROUNDS)
        .then(function(hash) {
            return users.insertAsync({
                "username": username,
                "hash": hash,
                "name": req.body.name,
                "class": req.body.class,
                "phone": req.body.phone,
                "email": req.body.email,
                "solved": [],
                "score": 0,
                "admin": false
            });
        });
    });
};

exports.authenticate = function(username, password) {
    return users.findOneAsync({ username: username })
    .then(function(user) {
        if (!user) throw Error("User does not exist");
        return bcryptjs.compareAsync(password, user.hash)
        .then(function(res) {
            if (!res) throw Error("Wrong password");
            return user;
        });
    });
};

exports.leaderboard = function() {
    return users.find({})
    .sort({ score: -1, admin: 1 })
    .execAsync();
};

exports.get = function(id) {
    return users.findOneAsync({ _id: id });
};

exports.clear = function(id) {
    return users.findOneAsync({ _id: id })
    .then(function(user) {
        user.solved = [];
        user.score = 0;
        return users.updateAsync({ _id: id }, { $set: user });
    });
}

exports.delete = function(id) {
    return users.findOneAsync({ _id: id })
    .then(function(user) {
        if (user.admin) throw Error("User is an admin");
        return users.removeAsync({ _id: id });
    });
};

exports.solve = function(id, question, score) {
    return users.findOneAsync({ _id: id })
    .then(function(user) {
        if (user.solved.includes(question))
            throw Error("Points already claimed");
        user.solved.push(question);
        user.score += score;
        return users.updateAsync({ _id: id }, { $set: user });
    });
};