import fs from 'node:fs/promises';
import { argument, readJson } from './io.js';

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const input = argument('--input');
const output = argument('--output');
if (!input || !output) throw new Error('Usage: node ai/src/render-pr-comment.js --input result.json --output comment.md');

const result = await readJson(input);
const analysis = result.value;
const lines = [
  '## AI-assisted failure triage',
  '',
  `**Category:** ${escape(analysis.failureCategory)}  `,
  `**Risk:** ${escape(analysis.risk)}  `,
  `**Confidence:** ${Math.round(analysis.confidence * 100)}%  `,
  `**Provider:** ${escape(result.model)} · **Prompt:** ${escape(result.promptVersion)}`,
  '',
  escape(analysis.summary),
  '',
  `**Likely cause:** ${escape(analysis.likelyCause)}`,
  '',
  '**Evidence**',
  ...analysis.evidence.map(item => `- ${escape(item)}`),
  '',
  '**Recommended human checks**',
  ...analysis.recommendedActions.map(item => `- ${escape(item)}`),
  '',
  '> AI-generated analysis is advisory. It cannot merge code, approve Percy, execute commands or change tests.',
];
await fs.writeFile(output, `${lines.join('\n')}\n`);
