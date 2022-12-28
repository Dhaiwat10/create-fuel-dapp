import { Command } from 'commander';
import packageJson from './package.json';
import chalk from 'chalk';
import { mkdir } from 'fs/promises';
import { exec } from 'child_process';

const main = async () => {
  let projectPath = '';

  const program = new Command(packageJson.name)
    .version(packageJson.version)
    .arguments('<project-directory>')
    .usage(`${chalk.green('<project-directory>')} [options]`)
    .action((name) => {
      projectPath = name;
    })
    .parse(process.argv);

  await mkdir(projectPath);
  process.chdir(projectPath);
  exec(
    'git clone https://github.com/dhaiwat10/fuel-dapp-template.git .',
    (err: any, stdout: any, stderr: any) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(stdout);
    }
  );
};

main();
