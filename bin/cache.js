const fs = require('fs');

const PATH = 'progress.json';

function progressFile() {
  const progress = fs.readFileSync(PATH);

  return JSON.parse(progress);
}

function writeProgressFile(json) {
  fs.writeFileSync(PATH, JSON.stringify(json, null, 2));
}
module.exports = {
  progressFile,
  writeProgressFile,
}
