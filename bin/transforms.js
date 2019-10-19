const fs = require('fs');
const path = require('path');
const { run } = require('./shell');
const codemodCli = require('codemod-cli');

async function runCodemods({ cwd }) {
  await codemodCli.runTransform(__dirname, 'license-date-update', path.join(cwd, 'LICENSE'));
}

module.exports = {
  runCodemods,
};
