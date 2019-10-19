const fetch = require('node-fetch');
const { GITHUB_REGEX } = require('./git');
const { progressFile, writeProgressFile } = require('./cache');

async function scrapeEverything() {
  let repos = await getRepositories();

  console.log(repos);


  repos = repos.slice(0, 1);

  let allRepos = [];

  for (let i = 0; i < repos.length; i++) {
    const { url, name } = repos[i];
    console.log(`Getting Repos from ${name}`);

    const repoLicense = await getLicenseForRepo({ url });

    allRepos = allRepos.concat(repoLicense);
  }

  console.log(`There are ${allRepos.length} repos`);

  await filterAndWriteToCache(allRepos);

  const reposNeedingPr = progressFile();

  console.log(`There are ${Object.keys(reposNeedingPr).length} repos with outdated LICENSE`);

  return reposNeedingPr;
}

async function getRepositories() {
  const url = `https://api.github.com/repositories?since=364`;

  return getDataFromUrl(url);
}

async function getLicenseForRepo({ url }) {
  const data = await getDataFromUrl(url);
  const result = [];

  result.push({
    gitUrl: url,
    license: data.license,
  });

  return result;
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
    const response = await fetch(url);
    const json = await response.json();

    data = json || [];
  } catch (e) {
    console.log(e);
  }

  return data;
}

async function getLicense(gitUrl) {
  console.log('called');

  const rawUrl = gitUrl.replace(`://github`, `://raw.githubusercontent`);
  const url = `${rawUrl}/master/license`;

  let licenseText;

  try {
    const response = await fetch(url);

    licenseText = await response.text();
  } catch (e) {
    console.error(e);
    return '';
  }

  return licenseText;
}

function isDateOutdated(license) {
  const json = license.toLowerCase();

  const date = new Date();
  const year = date.getFullYear();

  return !json.includes(year);
}

function ownerRepoFromUrl(gitUrl) {
  const matches = gitUrl.match(GITHUB_REGEX);

  if (!matches) {
    console.log('no matches for url:', gitUrl);
    return {};
  }

  const [_match, owner, repo] = matches;

  const key = `${owner}/${repo}`

  return { key, owner, repo };
}

async function main() {
  const dude = await scrapeEverything();

  console.log(dude);
}

main();

module.exports = {
  scrapeEverything,
};
