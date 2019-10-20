import path from 'path';
import codemodCli from 'codemod-cli';

export async function runCodemods({ cwd }) {
  await codemodCli.runTransform(__dirname, 'license-date-update', path.join(cwd, 'LICENSE'));
}
