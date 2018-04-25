var problems = require("../database/questions.js");
var fs = require("fs")

var Promise = require("bluebird");
var decache = require("decache");
Promise.promisifyAll(fs);

exports.all = function() {
    return problems;
};

exports.check = function(category, id, answer) {
    return new Promise(function(resolve, reject) {
        if (!problems[category])
            return reject(Error("Category does not exist"));
        if (!problems[category][id])
            return reject(Error("Problem with that ID does not exist"));
        if (!problems[category][id].answers.includes(answer))
            return reject(Error("Wrong answer"));
        resolve(problems[category][id].score);
    });
};

exports.update = function(data) {
    return fs.writeFileAsync("./database/questions.js", "module.exports = " + data)
    .then(function() {
        decache("../database/questions.js");
        problems = require("../database/questions.js");
    });
}