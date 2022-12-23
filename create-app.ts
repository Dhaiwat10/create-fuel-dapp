/* eslint-disable import/no-extraneous-dependencies */
import chalk from 'chalk';
import cpy from 'cpy';
import fs from 'fs';
import os from 'os';
import path, { join } from 'path';
import { makeDir } from './helpers/make-dir';
import { tryGitInit } from './helpers/git';
import { install } from './helpers/install';
import { isFolderEmpty } from './helpers/is-folder-empty';
import { getOnline } from './helpers/is-online';
import { isWriteable } from './helpers/is-writeable';
import type { PackageManager } from './helpers/get-pkg-manager';

export class DownloadError extends Error {}

export async function createApp({
  appPath,
  packageManager,
}: {
  appPath: string;
  packageManager: PackageManager;
}): Promise<void> {
  const root = path.resolve(appPath);

  if (!(await isWriteable(path.dirname(root)))) {
    console.error(
      'The application path is not writable, please check folder permissions and try again.'
    );
    console.error(
      'It is likely you do not have write permissions for this folder.'
    );
    process.exit(1);
  }

  const appName = path.basename(root);

  await makeDir(root);
  if (!isFolderEmpty(root, appName)) {
    process.exit(1);
  }
  await makeDir(join(root, 'frontend'));

  const useYarn = packageManager === 'yarn';
  const isOnline = !useYarn || (await getOnline());
  const originalDirectory = process.cwd();

  console.log(`⚡️ Setting up your new Fuel dapp in ${chalk.green(root)}.`);
  console.log();

  process.chdir(root);

  /**
   * Otherwise, if an example repository is not provided for cloning, proceed
   * by installing from a template.
   */
  console.log(chalk.bold(`Using ${packageManager}.`));
  /**
   * Create a package.json for the new project.
   */
  const packageJson = {
    name: appName,
    version: '0.1.0',
    private: true,
    scripts: {
      start: 'react-scripts start',
      build: 'react-scripts build',
      test: 'react-scripts test',
      eject: 'react-scripts eject',
    },
    eslintConfig: {
      extends: ['react-app', 'react-app/jest'],
    },
    browserslist: {
      production: ['>0.2%', 'not dead', 'not op_mini all'],
      development: [
        'last 1 chrome version',
        'last 1 firefox version',
        'last 1 safari version',
      ],
    },
  };
  /**
   * Write it to disk.
   */
  fs.writeFileSync(
    path.join(root, 'frontend', 'package.json'),
    JSON.stringify(packageJson, null, 2) + os.EOL
  );
  /**
   * These flags will be passed to `install()`.
   */
  const installFlags = { packageManager, isOnline };

  /**
   * Default dependencies.
   */
  const dependencies = [
    'react@^18',
    'react-dom@^18',
    'react-scripts@^5',
    'typescript@^4',
    'web-vitals@^2',
    'fuels@0.28.0',
    '@testing-library/jest-dom',
    '@testing-library/react',
    '@testing-library/user-event',
    '@types/jest',
    '@types/node',
    '@types/react',
    '@types/react-dom',
  ];
  /**
   * Default devDependencies.
   */
  const devDependencies: string[] = [];

  /**
   * Install package.json dependencies if they exist.
   */
  if (dependencies.length) {
    console.log();
    console.log('Installing dependencies:');
    for (const dependency of dependencies) {
      console.log(`- ${chalk.cyan(dependency)}`);
    }
    console.log();

    await install(path.join(root, 'frontend'), dependencies, installFlags);
  }
  /**
   * Install package.json devDependencies if they exist.
   */
  if (devDependencies.length) {
    console.log();
    console.log('Installing devDependencies:');
    for (const devDependency of devDependencies) {
      console.log(`- ${chalk.cyan(devDependency)}`);
    }
    console.log();

    const devInstallFlags = { devDependencies: true, ...installFlags };
    await install(
      path.join(root, 'frontend'),
      devDependencies,
      devInstallFlags
    );
  }
  console.log();
  /**
   * Copy the template files to the target directory.
   */
  await cpy('**', root, {
    // @ts-expect-error
    parents: true,
    cwd: path.join(__dirname, 'default'),
    rename: (name) => {
      switch (name) {
        case 'env.example':
        case 'gitignore':
        case 'eslintrc.json': {
          return '.'.concat(name);
        }
        // README.md is ignored by webpack-asset-relocator-loader used by ncc:
        // https://github.com/vercel/webpack-asset-relocator-loader/blob/e9308683d47ff507253e37c9bcbb99474603192b/src/asset-relocator.js#L227
        case 'README-template.md': {
          return 'README.md';
        }
        default: {
          return name;
        }
      }
    },
  });

  if (tryGitInit(root)) {
    console.log('Initialized a git repository.');
    console.log();
  }

  let cdpath: string;
  if (path.join(originalDirectory, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }

  console.log(`${chalk.green('Success!')} Created ${appName} at ${appPath}`);
  console.log('Inside that directory, you can run several commands:');
  console.log();
  console.log(chalk.cyan(`  ${packageManager} ${useYarn ? '' : 'run '}start`));
  console.log('    Starts the development server.');
  console.log();
  console.log(chalk.cyan(`  ${packageManager} ${useYarn ? '' : 'run '}build`));
  console.log('    Builds the app for production.');
  console.log();
  console.log();
  console.log('We suggest that you begin by typing:');
  console.log();
  console.log(chalk.cyan('  cd'), cdpath);
  console.log(
    `  ${chalk.cyan(`${packageManager} ${useYarn ? '' : 'run '}start`)}`
  );
  console.log();
}
