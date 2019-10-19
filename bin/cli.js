#!/usr/bin/env node

const tmp = require('tmp');
const { scrapeEverything } = require('./github-scrapper');
const { progressFile, writeProgressFile } = require('./cache');
const { runCodemods } = require('./transforms');
const {
  getUserName,
  repoExists,
  fork,
  clone,
  pushBranch,
  createPR,
  wasPrClosed,
  checkoutBranch,
} = require('./git');

async function updateLicenseDate() {
  const progress = progressFile();
  const repos = Object.keys(progress);

  for (let i = 0; i <= 200; i++) {
    const key = repos[i];
    const info = progress[key];

    if (info.prCreated) {
      console.log(`${key} already has a PR created.`);
      continue;
    }

    const updateState = (dataForRepo = {}) => {
      progress[key] = {
        ...dataForRepo,
        ...info,
      };

      writeProgressFile(progress);
    };

    await updateLicense(info, updateState);
  }
}

async function updateLicense(theirs, updateState) {
  let userName = await getUserName();
  let { repo } = theirs;
  let mine = { owner: userName, repo };

  let { name: tmpPath, removeCallback: cleanTmp } = tmp.dirSync();

  try {
    if (await wasPrClosed({ user: userName, repo })) {
      console.log(`PR for ${userName}/${repo} was closed or merged`);
      return;
    }

    if (!(await repoExists(mine))) {
      await fork(theirs);
    }

    updateState({ forked: true });

    const repoPath = await clone({ owner: userName, repo, cwd: tmpPath });

    await checkoutBranch({ cwd: repoPath });
    await runCodemods({ cwd: repoPath });
    await pushBranch({ cwd: repoPath, repo, owner: userName, updateState });
    await createPR({
      base: userName,
      upstream: theirs.owner,
      repo,
      updateState,
    });
  } catch (e) {
    console.log('sadness');
    console.error(e);
  } finally {
    cleanTmp();
  }
}

async function begin() {
  await scrapeEverything();
  await updateLicenseDate();
}

begin();
