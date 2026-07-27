const fs = require("node:fs/promises");
const path = require("node:path");

const QUESTIONS_PATH = path.join(__dirname, "..", "database", "questions.js");

let problems = {};

async function loadProblems() {
  try {
    const content = await fs.readFile(QUESTIONS_PATH, "utf8");
    const module = { exports: {} };
    new Function("module", "exports", content)(module, module.exports);
    problems = module.exports;
  } catch {
    problems = {};
  }
}

loadProblems();

exports.all = function () {
  return problems;
};

exports.check = function (category, id, answer) {
  if (!problems[category]) {
    throw new Error("Category does not exist");
  }
  if (!problems[category][id]) {
    throw new Error("Problem with that ID does not exist");
  }
  if (!problems[category][id].case_sensitive) {
    answer = answer.toLowerCase();
  }
  if (!problems[category][id].answers.includes(answer)) {
    throw new Error("Wrong answer");
  }
  return problems[category][id].stars;
};

exports.update = async function (data) {
  await fs.writeFile(QUESTIONS_PATH, `module.exports = ${data}`);
  await loadProblems();
};
