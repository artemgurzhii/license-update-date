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
  checkoutBranch,
} = require('./git');

async function updateLicenseDate() {
  console.log('updateLicenseDate called');

  const progress = progressFile();
  const repos = Object.keys(progress);

  for (let i = 0; i <= 200; i++) {
    const key = repos[i];
    const info = progress[key];

    if (info && info.prCreated) {
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
  console.log('updateLicense also called');

  let userName = await getUserName();
  let { repo } = theirs;
  let mine = { owner: userName, repo };

  let { name: tmpPath, removeCallback: cleanTmp } = tmp.dirSync();

  try {
    await fork(theirs);

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
