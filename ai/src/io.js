import fs from 'node:fs/promises';

export function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

export async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

export async function writeJson(file, value) {
  await fs.mkdir(new URL('.', `file://${file}`).pathname, { recursive: true }).catch(() => {});
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}
