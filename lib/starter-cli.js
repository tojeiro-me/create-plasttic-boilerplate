/** Imports */

import chalk from 'chalk';
import compareVersions from 'compare-versions';
import fs from 'fs-extra';
import fuzzy from 'fuzzy';
import elapsed from 'elapsed-time-logger';
import glob from 'fast-glob';
import inquirer from 'inquirer';
import inquirerAutocomplete from 'inquirer-autocomplete-prompt';
import ora from 'ora';
import os from 'os';
import path from 'path';
import pacote from 'pacote';
import yargsParser from 'yargs-parser';

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
    console.log(chalk.red('Exit!'));
    return;
  }
  spinner = ora(
    `Downloading ${PROJECT} to the ${ANSWERS.folder} folder`
  ).start();
  await fs.ensureDir(TEMPDIR);
  console.log(chalk.green(targetDir));
}

// Add to export default

async function CreateBoilerplateCLI(argvs) {
  try {
    const { from: nameWithVersion } = await extract(
      `${PROJECT}@${version}`,
      TEMPDIR,
      {}
    );
    await fs.copy(`${TEMPDIR}/dist`, targetDir);
    const timerDownloaded = timer.get();
    console.log(targetDir);
    await replaceGitignore(targetDir, version, argv);
    spinner.succeed(` ${nameWithVersion} copied to ${targetDir}!`);
  } catch (err) {
    if (err.code === 'ETARGET') {
      const msg = chalk.red(
        `version '${err.wanted}' not found in npm registry\navailable versions:\n`
      );
      spinner.fail(msg + err.versions.reverse().join(' | '));
      throw err.code;
    }
    spinner.fail('✖ Unexpected error');
    throw new Error(err);
  } finally {
    await fs.remove(TEMPDIR);
  }
}

/** 
async function CreateBoilerplateCLI(argvs) {
  const argv = yargsParser(argvs, {
    alias: { release: ['r'], yes: ['y'] },
  });
  const timer = elapsed.start();
  const version = (argv.release || 'latest').toString();
  const targetDir = path.resolve(process.cwd(), argv._[0] || './');
  const override = await checkFolder(targetDir, argv);
  if (targetDir === './') {
    console.log(targetDir);
    process.exit(0);
  }
  if (!override) {
    console.log(chalk.red('Exit!'));
    return;
  }
  spinner = ora(
    `Downloading ${PROJECT} version '${version}' to ${targetDir}`
  ).start();
  await fs.ensureDir(TEMPDIR);
  try {
    const { from: nameWithVersion } = await extract(
      `${PROJECT}@${version}`,
      TEMPDIR,
      {}
    );
    await fs.copy(`${TEMPDIR}/dist`, targetDir);
    const timerDownloaded = timer.get();
    console.log(targetDir);
    await replaceGitignore(targetDir, version, argv);
    spinner.succeed(` ${nameWithVersion} copied to ${targetDir}!`);
  } catch (err) {
    if (err.code === 'ETARGET') {
      const msg = chalk.red(
        `version '${err.wanted}' not found in npm registry\navailable versions:\n`
      );
      spinner.fail(msg + err.versions.reverse().join(' | '));
      throw err.code;
    }
    spinner.fail('✖ Unexpected error');
    throw new Error(err);
  } finally {
    await fs.remove(TEMPDIR);
  }
}
*/

/** Variables */

const CHOICES = ['Project starter', 'HTML only'];
const LOCATION = '../templates';
const TEMPLATES = [
  `${LOCATION}/plasttic-boilerplate/dist/`,
  `${LOCATION}/plasttic-boilerplate/dist/boilerplate.html`,
];
const PROJECT = 'Plasttic-boilerplate';
const TEMPDIR = `${os.tmpdir()}/${PROJECT}-staging`;
const extract = (a, b, c) => pacote.extract(a, b, c);
let spinner;

/** Questions for project type and folder name */

const QUESTIONS = [
  {
    name: 'template',
    type: 'list',
    message: 'What template would you like to generate?',
    choices: CHOICES,
  },
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
};

/** Check if .gitignore exists and ask if to override */

const replaceGitignore = async (targetDir, version, argv) => {
  // see https://github.com/mrmlnc/fast-glob#how-to-write-patterns-on-windows
  const npmIgnoreFiles = await glob(
    `${targetDir.replace(/\\/g, '/')}/**/.npmignore`
  );
  await Promise.all(
    // eslint-disable-next-line arrow-body-style
    npmIgnoreFiles.map((fileName) => {
      return fs.rename(
        fileName,
        fileName.replace(/\.npmignore$/, '.gitignore')
      );
    })
  );
  const skipPrompts = argv.yes === true;

  if (skipPrompts) {
  }
};
