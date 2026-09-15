const SECRET_PATTERNS = [
  /\bsk-[a-z0-9_-]{10,}\b/gi,
  /\b(?:api[_-]?key|token|password)\s*[:=]\s*\S+/gi,
  /-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+ PRIVATE KEY-----/g,
];

export function sanitizeEvidence(value, maxLength = 12000) {
  let text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  for (const pattern of SECRET_PATTERNS) text = text.replace(pattern, '[REDACTED]');
  return text.slice(0, maxLength);
}

export function containsPromptInjection(text) {
  return /(ignore (all|any|the) previous|system prompt|reveal .*secret|print .*env|approve .*pull request|merge .*branch|execute .*command|base64|jailbreak)/i.test(text);
}
