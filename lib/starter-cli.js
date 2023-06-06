/*** Imports */

import fs from "fs-extra";
import inquirer from "inquirer";

/*** Variables */

// const CHOICES = fs.readdirSync('./project-name/');
const CHOICES = ['Project starter', 'HTML only'];
const LOCATION = '../templates';
const TEMPLATES = [`${LOCATION}/plasttic-boilerplate`, `${LOCATION}/plasttic-boilerplate/boilerplate.html`];

/***  Choose full project or HTML only */

const QUESTIONS = [
  {
    name: 'project-choice',
    type: 'list',
    message: 'What template would you like to generate?',
    choices: CHOICES
  },
  {
    name: 'project-name',
    type: 'input',
    message: 'Project name:',
    validate: function (input) {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) {
        return true;
  } else {
        return 'Project name may only include letters, numbers, underscores and hashes.';
      }
    }
  }
];

/** Execute the CLI app */

export default function starterCli() {
  inquirer.prompt(QUESTIONS)
    .then(answers => {
      console.log(answers);
  });
}