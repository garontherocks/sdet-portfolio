# Contributing

## Local checks

Use Node.js 22 or newer and install the committed dependency graph:

```bash
npm ci
npm run quality
```

Run the focused suites as needed:

```bash
npm run test:smoke --workspace=cypress
npm run test:smoke --workspace=playwright
npm run test:api --workspace=cypress
npm run test:api --workspace=playwright
npm run k6:smoke
```

Authenticated ReqRes tests require `REQRES_API_KEY`. Percy runs require `PERCY_TOKEN`.

## Pull requests

- Keep selectors stable and prefer application-provided `data-test` attributes.
- Add assertions that prove user-visible behavior or an API contract.
- Do not accept multiple unrelated statuses simply to make an integration test pass.
- Update documentation when commands, paths or quality claims change.
- Include failure evidence when changing a threshold or retry policy.

Stress tests are intentionally opt-in and must not be expanded against a third-party service without considering responsible load limits.
