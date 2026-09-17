# AI-first quality agent integration

The companion [AI-first quality agent](https://github.com/garontherocks/ai-first-quality-agent) demonstrates the agentic layer separately from this multi-tool SDET portfolio. Version 1 covers typed agent contracts, deterministic and optional live providers, bounded MCP tools, approval-gated test execution, lifecycle hooks, redacted telemetry and adversarial evaluations.

## Evidence contract

The producer owns `evidence/v1/contract.json`. This repository keeps a reviewed snapshot at `integrations/ai-first-quality-agent/evidence-contract.json` and validates it with:

```bash
npm run ai:agent-evidence
node --test tools/ai/verify-agent-evidence.test.js
```

The contract pins the source repository and workflow, artifact name, deterministic provider, five required adversarial categories, 100% overall and category gates, and zero expected CI cost. The producer workflow verifies its current report against the same contract and uploads both as the `quality-evidence-v1` artifact.

## Trust and release model

- No personal access token is shared between repositories.
- Required CI does not call a paid model or require model credentials.
- This repository never executes downloaded evidence from another workflow.
- Contract updates arrive through a normal reviewed pull request.
- The producer remains the authoritative source; the snapshot records which guarantees this portfolio currently claims.

When the producer introduces a new contract version, review its changed guarantees first, update this snapshot and verifier together, and let both repositories pass independently before describing the new capability as released.
