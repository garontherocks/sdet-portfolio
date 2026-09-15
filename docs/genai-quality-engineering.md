# GenAI quality engineering

The AI layer is intentionally read-only and provider-independent. Normal pull-request CI uses a deterministic provider so contributors do not need credentials and results remain reproducible. A manually dispatched trusted workflow can exercise the same contracts against OpenAI when `OPENAI_API_KEY` is configured.

## Controls

- Model output is rejected unless it matches a strict JSON schema.
- Logs and requirements are treated as untrusted evidence, not instructions.
- Common secret formats are redacted before model submission.
- Generated test plans are written only to `ai/generated/review-required`.
- No AI component can approve Percy, merge a pull request, execute recommendations or modify tests.
- Live evaluation is unavailable to ordinary pull requests and forks.
- PR comments are created only by an explicit, manually dispatched `AI Failure Triage` workflow.

## Evaluation contract

The labeled suite covers application regressions, test defects, infrastructure failures, flaky timing, insufficient evidence and prompt injection. CI requires at least ten cases, 85% classification accuracy and 100% schema compliance.

The mock provider validates orchestration, security boundaries and evaluation mechanics. Live-provider scores must be interpreted separately because model behavior can change. Both reports record provider, prompt version, latency, token usage, optional estimated cost and case-level outcomes. Set `AI_INPUT_COST_PER_MILLION` and `AI_OUTPUT_COST_PER_MILLION` when cost estimation is required; no price is hard-coded.

## Commands

```bash
npm run ai:test
npm run ai:eval
npm run ai:triage -- --input failure.log --test checkout
npm run ai:generate-tests -- --requirement ai/examples/checkout-requirement.md --id REQ-CHECKOUT-001
```

For an explicit live invocation:

```bash
OPENAI_API_KEY=... AI_MODEL=gpt-5-mini npm run ai:eval:live
```

The manual `AI Failure Triage` workflow accepts a PR number, test name and failure evidence. It posts an escaped advisory comment using either the deterministic provider or the optional live model. Selecting the live model requires the repository `OPENAI_API_KEY` secret; `AI_MODEL` can be set as a repository variable.
