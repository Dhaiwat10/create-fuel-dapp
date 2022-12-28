import { Command } from 'commander';
import packageJson from './package.json';
import chalk from 'chalk';
import { mkdir, unlink } from 'fs/promises';
import tar from 'tar';
import { join } from 'path';
import { tmpdir } from 'os';
import { pipeline } from 'stream/promises';
import got from 'got';
import { createWriteStream } from 'fs';
import commandExists from 'command-exists';

async function downloadTar(url: string) {
  const tempFile = join(tmpdir(), `create-fuel-dapp.temp-${Date.now()}`);
  await pipeline(got.stream(url), createWriteStream(tempFile));
  return tempFile;
}

const printWarningIfDockerNotInstalled = async () => {
  commandExists('docker').catch(() => {
    console.log(
      chalk.yellow(
        '⚠️ Docker is not installed. You need Docker to run a local Fuel node.'
      )
    );
    console.log(
      'To install Docker, follow the instructions here: https://docs.docker.com/get-docker/'
    );
  });
};

const printWarningIfForcNotInstalled = async () => {
  commandExists('forc').catch(() => {
    console.log(
      chalk.yellow(
        '⚠️ Forc is not installed. You need forc to build and deploy your contracts.'
      )
    );
    console.log(
      `To install forc, run: curl --proto '=https' --tlsv1.2 -sSf https://fuellabs.github.io/fuelup/fuelup-init.sh | sh`
    );
  });
};

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
  const tempFile = await downloadTar(
    `https://codeload.github.com/Dhaiwat10/fuel-dapp-template/tar.gz/main`
  );
  await tar.x({
    file: tempFile,
    strip: 1,
    cwd: join(process.cwd(), projectPath),
  });
  await unlink(tempFile);

  console.log();
  console.log();
  console.log(
    chalk.green('⚡️ Success! Created a Fuel dapp at ' + projectPath)
  );
  console.log();
  console.log();
  console.log('To get started:');
  console.log();
  console.log(`- cd into the project directory: cd ${projectPath}`);
  console.log('- Start a local Fuel node by running `make services-run`');
  console.log(
    '- Build and deploy the contract by running `cd contracts && forc deploy --url 0.0.0.0:4000 --unsigned`'
  );
  console.log('- Run the frontend by running `cd frontend && npm start`');
  console.log();
  console.log();
  console.log('-> TS SDK docs: https://fuellabs.github.io/fuels-ts/');
  console.log('-> Sway docs: https://fuellabs.github.io/sway/');
  console.log(
    '-> If you have any questions, ask us on our Discord: https://discord.com/invite/xfpK4Pe'
  );
  console.log();
  console.log();

  await printWarningIfDockerNotInstalled();
  console.log();
  console.log();
  await printWarningIfForcNotInstalled();
};

main().catch((err) => {
  console.error(err);
});
