var problems = require("../database/questions.js");

var Promise = require("bluebird");

exports.all = function() {
    return problems;
}

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
}