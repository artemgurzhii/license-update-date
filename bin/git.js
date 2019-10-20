import Octokit from '@octokit/rest';
import path from 'path';
import Logger from 'js-logger';
import { run } from './shell';
import { PR_BRANCH_NAME } from './constants';

const { GITHUB_TOKEN } = process.env;

if (!GITHUB_TOKEN) {
  throw new Error(`Environment variable: GITHUB_TOKEN has not be set!`);
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

export async function getUserName() {
  const user = await octokit.users.getAuthenticated();

  return user.data.login;
}

export async function checkoutBranch({ cwd }) {
  Logger.info('switching branches...');

  try {
    await run(`git checkout -b ${PR_BRANCH_NAME}`, { cwd });
  } catch (e) {
    // branch exists?
  }

  await run(`git checkout ${PR_BRANCH_NAME}`, { cwd });

  Logger.info('fetching remote changes...');

  try {
    await run(`git pull origin ${PR_BRANCH_NAME}`, { cwd });
  } catch (e) {
    // branch does not exist
  }
}

export async function pushBranch({ cwd, updateState }) {
  await run(`git add .`, { cwd });
  await run(`git commit -m "update license date" --allow-empty`, { cwd });
  await run(`git push --set-upstream origin ${PR_BRANCH_NAME}`, { cwd });

  updateState({
    pushed: true,
  });
}

export async function gitUrlFor({ owner, repo }) {
  Logger.info(`getting git Url: ${owner}/${repo}`);

  const response = await octokit.repos.get({ owner, repo });

  return response.data.ssh_url;
}

export async function fork({ owner, repo }) {
  return await octokit.repos.createFork({ owner, repo });
}

export async function clone({ owner, repo, cwd }) {
  Logger.info(`cloning... ${owner}/${repo} into ${cwd}`);

  const gitUrl = await gitUrlFor({ owner, repo });

  await run(`git clone ${gitUrl}`, { cwd });

  return path.join(cwd, repo);
}

export async function createPR({ base, upstream, repo, updateState }) {
  Logger.info(`creating PR: ${upstream} <- ${base} with ${repo}`);

  await octokit.pulls.create({
    owner: upstream,
    repo,
    head: `${base}:${PR_BRANCH_NAME}`,
    base: 'master', // todo, fix for repos who have a different default
    title: 'Update License date',
    body: `
     This is an automated PR from: https://github.com/artemgurzhii/license-update-date

     This PR updates your license date as it was outdated
    `,
  });

  updateState({
    prCreated: true,
  });
}
