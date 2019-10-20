import fs from 'fs';
import { PROGRESS_CACHE_PATH } from './constants.js';

export function progressFile() {
  const progress = fs.readFileSync(PROGRESS_CACHE_PATH);

  return JSON.parse(progress);
}

export function writeProgressFile(json) {
  fs.writeFileSync(PROGRESS_CACHE_PATH, JSON.stringify(json, null, 2));
}
