#!/usr/bin/env node

import 'dotenv/config';
import Logger from 'js-logger';
import tmp from 'tmp';
import { scrapeEverything } from './github-scrapper';
import { progressFile, writeProgressFile } from './cache';
import { runCodemods } from './transforms';
import { getUserName, fork, clone, pushBranch, createPR, checkoutBranch } from './git';

Logger.useDefaults();
// Logger.setLevel(Logger.OFF);

async function updateLicenseDate() {
  const progress = progressFile();
  const repos = Object.keys(progress);

  for (const key of repos) {
    const info = progress[key];
    Logger.info(info);

    if (info && info.prCreated) {
      Logger.info(`${key} already has a PR created.`);
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
  const userName = await getUserName();

  const { repo } = theirs;
  const { name: tmpPath, removeCallback: cleanTmp } = tmp.dirSync();

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
    Logger.info('sadness');
    Logger.error(e);
  } finally {
    cleanTmp();
  }
}

async function begin() {
  await scrapeEverything();
  await updateLicenseDate();
}

begin();
