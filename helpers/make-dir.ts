import fs from 'fs';

export function makeDir(
  root: string,
  options = { recursive: true }
): Promise<void> {
  // @ts-expect-error
  return fs.promises.mkdir(root, options);
}
