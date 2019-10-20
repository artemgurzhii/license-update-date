import execa from 'execa';
import Logger from 'js-logger';

export async function run(command, options = {}) {
  Logger.info(`Running: ${command}`);

  return await execa(`source $HOME/.bash_profile && ${command}`, {
    stdio: 'inherit',
    shell: '/bin/bash',
    env: {
      PATH: process.env.PATH,
    },
    ...options,
  });
}
