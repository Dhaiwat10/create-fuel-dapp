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

async function downloadTar(url: string) {
  const tempFile = join(tmpdir(), `create-fuel-dapp.temp-${Date.now()}`);
  await pipeline(got.stream(url), createWriteStream(tempFile));
  return tempFile;
}

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
  const tempFile = await downloadTar(
    `https://codeload.github.com/Dhaiwat10/fuel-dapp-template/tar.gz/main`
  );
  await tar.x({
    file: tempFile,
    strip: 1,
  });
  await unlink(tempFile);
};

main();
