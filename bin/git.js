const Octokit = require('@octokit/rest');
const path = require('path');
const getPullRequests = require('github-pull-requests');
const { run } = require('./shell');

const BRANCH_NAME = 'update-license-date';
const { GITHUB_TOKEN } = process.env;

if (!GITHUB_TOKEN) throw new Error(`Environment variable: GITHUB_TOKEN has not be set!`)

const GITHUB_REGEX = /\/([\w-_]+)\/([\w-_]+)/;
const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

async function getUserName() {
  const user = await octokit.users.getAuthenticated();

  return user.data.login;
}

async function checkoutBranch({ cwd }) {
  console.log('switching branches...');

  try {
    await run(`git checkout -b ${BRANCH_NAME}`, { cwd });
  } catch (e) {
    // branch exists?
  }

  await run(`git checkout ${BRANCH_NAME}`, { cwd });

  console.log('fetching remote changes...');

  try {
    await run(`git pull origin ${BRANCH_NAME}`, { cwd });
  } catch (e) {
    // branch does not exist
  }
}

async function pushBranch({ cwd, updateState }) {
  await run(`git add .`, { cwd });
  await run(`git commit -m "update license date" --allow-empty`, { cwd });
  await run(`git push --set-upstream origin ${BRANCH_NAME}`, { cwd });

  updateState({
    pushed: true,
  });
}

async function gitUrlFor({ owner, repo }) {
  console.log(`getting git Url: ${owner}/${repo}`);

  const response = await octokit.repos.get({ owner, repo });

  return response.data.ssh_url;
}

async function repoExists({ owner, repo }) {
  try {
    const url = await gitUrlFor({ owner, repo });

    return Boolean(url);
  } catch (e) {
    switch (e.status) {
      case 404: return false;
      default:
        throw e;
    }
  }
}

async function fork({ owner, repo }) {
  return await octokit.repos.createFork({ owner, repo });
}

async function clone({ owner, repo, cwd }) {
  console.log(`cloning... ${owner}/${repo} into ${cwd}`);

  const gitUrl = await gitUrlFor({ owner, repo });

  await run(`git clone ${gitUrl}`, { cwd });

  return path.join(cwd, repo);
}

async function createPR({ base, upstream, repo, updateState }) {
  console.log(`creating PR: ${upstream} <- ${base} with ${repo}`);

  await octokit.pulls.create({
    owner: upstream,
    repo,
    head: `${base}:${BRANCH_NAME}`,
    base: 'master', // todo, fix for repos who have a different default
    title: 'Update License date',
    body: `
     This is an automated PR from: https://github.com/artemgurzhii/license-update-date

     This PR updates your license date as it was outdated
    `
  });

  updateState({
    prCreated: true,
  });
}

const currentPRs = [];

async function wasPrClosed({ user, repo }) {
  if (currentPRs.length === 0) {
    const prData = await getPullRequests(user, 'closed', { oAuthToken: GITHUB_TOKEN });

    currentPRs = prData.map(pr => pr.url);
  }

  for (let i = 0; i < currentPRs.length; i++) {
    const current = currentPRs[i];

    if (current.includes(user) && current.includes(repo)) return true;
  }

  return false;
}

module.exports = {
  fork,
  wasPrClosed,
  createPR,
  clone,
  GITHUB_REGEX,
  getUserName,
  checkoutBranch,
  pushBranch,
  gitUrlFor,
  repoExists,
};
