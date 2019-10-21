import fetch from 'node-fetch';
import Logger from 'js-logger';
import { DATE_REGEXP, DATE_WITH_PRESENT_REGEXP, DATE_WITH_DATE_REGEXP } from './constants';
import { progressFile, writeProgressFile } from './cache';

export async function scrapeEverything() {
  const repos = await getRepositories();
  let allRepos = [];

  for (let i = 0; i < repos.length; i++) {
    const { url, name } = repos[i];

    Logger.info(`Getting data from the repo: ${name}`);

    const repoLicense = await getLicenseForRepo({ url });

    if (repoLicense.license) {
      allRepos = allRepos.concat(repoLicense);
    }
  }

  Logger.info(`There are ${allRepos.length} repos`);

  await filterAndWriteToCache(allRepos);

  const reposNeedingPr = progressFile();

  Logger.info(`There are ${Object.keys(reposNeedingPr).length} repos with outdated LICENSE`);

  return reposNeedingPr;
}

function getRandNumber() {
  return Math.floor(Math.random() * 100000000) + 1;
}

async function getRepositories() {
  const url = `https://api.github.com/repositories?since=${getRandNumber()}`;

  const data = await getDataFromUrl(url);

  // NOTE: Get only first 10 repositories as github does not allow more with current access key
  return data.slice(0, 10);
}

async function getLicenseForRepo({ url }) {
  const data = await getDataFromUrl(url);

  return {
    gitUrl: url,
    license: data.license,
  };
}

async function filterAndWriteToCache(repoList) {
  const progress = progressFile();
  const alreadyVisited = Object.keys(progress);

  for (let i = 0; i < repoList.length; i++) {
    const { gitUrl } = repoList[i];

    const { owner, repo, key } = ownerRepoFromUrl(gitUrl);

    if (!owner && !repo) continue;

    if (!alreadyVisited.includes(key)) {
      const license = await getLicense(gitUrl);
      const isInNeedOfPR = isDateOutdated(license);

      if (isInNeedOfPR) {
        progress[key] = { owner, repo };
        writeProgressFile(progress);
      }
    }
  }

  writeProgressFile(progress);
}

async function getDataFromUrl(url) {
  let data = [];

  try {
    const response = await fetch(url, {
      auth: process.env.GITHUB_TOKEN,
    });
    const json = await response.json();

    data = json || [];
  } catch (e) {
    Logger.info(e);
  }

  return data;
}

async function getLicense(gitUrl) {
  const rawUrl = gitUrl.replace(`://github`, `://raw.githubusercontent`);
  const url = `${rawUrl}/master/LICENSE`;

  let licenseText;

  try {
    const response = await fetch(url, {
      auth: process.env.GITHUB_TOKEN,
    });

    licenseText = await response.text();
  } catch (e) {
    Logger.error(e);
    return '';
  }

  return licenseText;
}

function isDateOutdated(license) {
  const text = license.toLowerCase();

  if (!text.match(DATE_REGEXP) || text.match(DATE_WITH_PRESENT_REGEXP)) {
    return false;
  }

  const date = new Date();
  const currentYear = date.getFullYear();
  const doubleDateMatch = text.match(DATE_WITH_DATE_REGEXP);

  if (doubleDateMatch) {
    const [, lastYear] = doubleDateMatch[0].split('-');

    return lastYear !== `${currentYear}`;
  }

  return !text.includes(currentYear);
}

function ownerRepoFromUrl(gitUrl) {
  const url = gitUrl.replace('https://api.github.com/repos/', '');
  const [owner, repo] = url.split('/');

  const key = `${owner}/${repo}`;

  return { key, owner, repo };
}
