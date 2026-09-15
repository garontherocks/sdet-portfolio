export async function createOpenAIProvider({ apiKey = process.env.OPENAI_API_KEY, model = process.env.AI_MODEL || 'gpt-5-mini' } = {}) {
  if (!apiKey) throw new Error('OPENAI_API_KEY is required for the live provider');
  return {
    name: 'openai',
    async generate({ system, input, schema, schemaName }) {
      const started = Date.now();
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model,
          instructions: system,
          input,
          text: { format: { type: 'json_schema', name: schemaName, strict: true, schema } },
        }),
      });
      if (!response.ok) throw new Error(`OpenAI request failed (${response.status}): ${(await response.text()).slice(0, 500)}`);
      const payload = await response.json();
      const text = payload.output_text || payload.output?.flatMap(item => item.content || []).find(item => item.type === 'output_text')?.text;
      if (!text) throw new Error('OpenAI response contained no output text');
      return { value: JSON.parse(text), latencyMs: Date.now() - started, usage: payload.usage || null, model };
    },
  };
}
