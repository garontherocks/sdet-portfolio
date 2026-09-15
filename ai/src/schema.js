const typeOf = value => Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;

export function validateSchema(value, schema, at = '$') {
  const errors = [];
  if (schema.type && typeOf(value) !== schema.type) return [`${at} must be ${schema.type}`];
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${at} must be one of ${schema.enum.join(', ')}`);
  if (typeof value === 'string' && schema.minLength && value.length < schema.minLength) errors.push(`${at} is too short`);
  if (typeof value === 'number' && ((schema.minimum != null && value < schema.minimum) || (schema.maximum != null && value > schema.maximum))) errors.push(`${at} is out of range`);
  if (Array.isArray(value)) {
    if (schema.minItems && value.length < schema.minItems) errors.push(`${at} requires ${schema.minItems} item(s)`);
    if (schema.uniqueItems && new Set(value.map(JSON.stringify)).size !== value.length) errors.push(`${at} must contain unique items`);
    if (schema.items) value.forEach((item, index) => errors.push(...validateSchema(item, schema.items, `${at}[${index}]`)));
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const required of schema.required || []) if (!(required in value)) errors.push(`${at}.${required} is required`);
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) if (!(key in (schema.properties || {}))) errors.push(`${at}.${key} is not allowed`);
    }
    for (const [key, child] of Object.entries(schema.properties || {})) if (key in value) errors.push(...validateSchema(value[key], child, `${at}.${key}`));
  }
  return errors;
}

export function assertSchema(value, schema) {
  const errors = validateSchema(value, schema);
  if (errors.length) throw new Error(`Schema validation failed:\n${errors.join('\n')}`);
  return value;
}
