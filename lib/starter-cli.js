/** Imports */

import chalk from 'chalk';
import fs from 'fs-extra';
import elapsed from 'elapsed-time-logger';
// import glob from 'fast-glob';
import inquirer from 'inquirer';
import inquirerAutocomplete from 'inquirer-autocomplete-prompt';
import ora from 'ora';
import os from 'os';
import path from 'path';
import pacote from 'pacote';

/** Export the CLI app */

export default async function starterCli() {
  // Ask for the project type and folder name
  const ANSWERS = await inquirer.prompt(QUESTIONS);
  if (!ANSWERS) {
    console.log(chalk.red('Error!'));
    process.exit(0);
  }

  // Start timer
  const timer = elapsed.start();

  // Define Target Directory and check if it's nor the root folder
  const targetDir = path.resolve(process.cwd(), ANSWERS.folder || './');
  if (targetDir === './') {
    console.log(chalk.red('Error!'));
    process.exit(0);
  }

  // Check if the folder already exists
  const override = await checkFolder(targetDir, ANSWERS.folder);
  if (!override) {
    console.log(chalk.red('Cancelled!'));
    return;
  }
  spinner = ora(
    `Downloading ${PROJECT} to the ${ANSWERS.folder} folder`
  ).start();
  await fs.ensureDir(TEMPDIR);

  // Download the boilerplate and copy it to the target directory
  try {
    // Download to temp folder
    const { from: nameWithVersion } = await extract(
      `${PROJECT}@latest`,
      TEMPDIR,
      {}
    );
    // Copy to target directory
    await fs.copy(`${TEMPDIR}/dist`, targetDir);
    // await replaceGitignore(targetDir, version, argv);
    // Success message
    const timerDownloaded = timer.get();
    spinner.succeed(
      `${nameWithVersion} copied to ${ANSWERS.folder} in ${timerDownloaded}!`
    );
  } catch (err) {
    if (err.code === 'ETARGET') {
      const msg404 = chalk.red(`${err.wanted} not found in npm registry!\n`);
      spinner.fail(msg404);
      throw err.code;
    }
    const msgFail = chalk.red(`Unexpected error!\n`);
    spinner.fail(msgFail);
    throw new Error(err);
  } finally {
    await fs.remove(TEMPDIR);
  }
}

/** Variables */

// const CHOICES = ['Project starter'];
const LOCATION = '../templates';
const TEMPLATES = [
  `${LOCATION}/plasttic-boilerplate/dist/`,
  `${LOCATION}/plasttic-boilerplate/dist/boilerplate.html`,
];
const PROJECT = 'plasttic-boilerplate';
const TEMPDIR = `${os.tmpdir()}/${PROJECT}-staging`;
const extract = (a, b, c) => pacote.extract(a, b, c);
let spinner;

/** Questions for project type and folder name */

const QUESTIONS = [
  {
    name: 'folder',
    type: 'input',
    message: 'Project name:',
    validate(input) {
      if (/^([A-Za-z\-_\d])+$/.test(input)) {
        return true;
      }
      return 'Project name may only include letters, numbers, underscores and dashes.';
    },
  },
];

/** Start CLI app */

inquirer.registerPrompt('autocomplete', inquirerAutocomplete);

/** Check if folder exists and ask if to override, or create new */

const checkFolder = async (targetDir, arg) => {
  if (targetDir && arg) {
    const folderExists = await fs.pathExists(targetDir);
    // folder doesn't exist, create new folder
    if (!folderExists) {
      await fs.ensureDir(targetDir);
      return true;
    }
    // folder exists, ask if to override
    if (folderExists) {
      const { override } = await inquirer.prompt({
        type: 'confirm',
        name: 'override',
        message: `The ${arg} folder already exists, proceed?`,
        default: true,
      });
      if (!override) {
        return override;
      }

      // folder exists and has files, ask if to override
      const folderFiles = await fs.readdir(targetDir);
      if (folderFiles.length !== 0) {
        const { override } = await inquirer.prompt({
          type: 'confirm',
          name: 'override',
          message: `The ${arg} folder is not an empty, proceed?`,
          default: true,
        });
        return override;
      }
    }
  }

  /** Check if .gitignore exists and ask if to override */

  // const replaceGitignore = async (targetDir, version, argv) => {
  //   // see https://github.com/mrmlnc/fast-glob#how-to-write-patterns-on-windows
  //   const npmIgnoreFiles = await glob(
  //     `${targetDir.replace(/\\/g, '/')}/**/.npmignore`
  //   );
  //   await Promise.all(
  //     // eslint-disable-next-line arrow-body-style
  //     npmIgnoreFiles.map((fileName) => {
  //       return fs.rename(
  //         fileName,
  //         fileName.replace(/\.npmignore$/, '.gitignore')
  //       );
  //     })
  //   );
  //   const skipPrompts = argv.yes === true;

  //   if (skipPrompts) {
  //   }
  // };
};
