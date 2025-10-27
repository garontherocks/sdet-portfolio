// Synthetic user data generator (Node ESM)
// Usage: node tools/data-gen/generateUsers.js --count=20 --seed=42
import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { faker } from '@faker-js/faker';

function parseArgs() {
  const out = { count: 20, seed: 42, promptTemplate: null };
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    const [k, v] = arg.startsWith('--') ? arg.slice(2).split('=') : [null, null];
    if (!k) continue;
    if (k === 'count') out.count = Number(v ?? process.argv[++i]);
    else if (k === 'seed') out.seed = Number(v ?? process.argv[++i]);
    else if (k === 'promptTemplate') out.promptTemplate = String(v ?? process.argv[++i]);
  }
  if (!Number.isFinite(out.count) || out.count <= 0) out.count = 20;
  if (!Number.isFinite(out.seed)) out.seed = 42;
  return out;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true }).catch(() => {});
}

function pick(arr) { return arr[Math.floor(faker.number.int({ min: 0, max: arr.length - 1 }))]; }

function buildUser(id) {
  const first = faker.person.firstName();
  const last = faker.person.lastName();
  const email = faker.internet.email({ firstName: first, lastName: last }).toLowerCase();
  const roles = ['user', 'admin', 'manager', 'viewer'];
  const role = pick(roles);
  const allFlags = ['betaCheckout', 'newDashboard', 'abRecommendations', 'featureX'];
  const featureFlags = Object.fromEntries(allFlags.map(f => [f, faker.datatype.boolean()]));
  return {
    id,
    name: `${first} ${last}`,
    email,
    username: faker.internet.userName({ firstName: first, lastName: last }).toLowerCase(),
    password: faker.internet.password({ length: 12 }),
    role,
    featureFlags,
    address: {
      city: faker.location.city(),
      country: faker.location.country(),
    }
  };
}

async function maybeMutateWithAI(users, promptTemplate) {
  if (!promptTemplate) return users;
  // Stub only: no external calls. Demonstrate how a prompt might be used.
  // For determinism and no-network policy, we just append a suffix token.
  const suffix = (process.env.AI_SUFFIX || 'AI').toLowerCase();
  return users.map(u => ({ ...u, name: `${u.name} (${suffix})` }));
}

async function main() {
  const { count, seed, promptTemplate } = parseArgs();
  faker.seed(seed);

  const usersRaw = Array.from({ length: count }, (_, i) => buildUser(i + 1));
  const users = await maybeMutateWithAI(usersRaw, promptTemplate);

  const cypressOut = path.join(process.cwd(), 'cypress', 'fixtures');
  const pwOut = path.join(process.cwd(), 'playwright', 'tests', 'fixtures');
  await ensureDir(cypressOut);
  await ensureDir(pwOut);

  const payload = { seed, count: users.length, users };
  const cyFile = path.join(cypressOut, 'users.json');
  const pwFile = path.join(pwOut, 'users.json');
  await fs.writeFile(cyFile, JSON.stringify(payload, null, 2));
  await fs.writeFile(pwFile, JSON.stringify(payload, null, 2));
  console.log(`[data-gen] wrote ${users.length} users to:\n - ${cyFile}\n - ${pwFile}`);
}

main().catch(err => { console.error('[data-gen:error]', err); process.exit(1); });

