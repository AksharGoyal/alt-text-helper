# Contributing

Contributions are welcome, including during Hacktoberfest.

## Setup

```bash
npm install
npm run dev
```

Node 22.12 or newer is required (`.nvmrc` pins 24).

## Before you open a pull request

```bash
npm run format:check && npm run lint && npm run typecheck && npm test
```

The git hooks run these checks for you once `npm install` has set up Husky:

- `pre-commit` formats and lints staged files.
- `commit-msg` enforces [Conventional Commits](https://www.conventionalcommits.org), for example `feat: add model picker`.
- `pre-push` runs the type check and the tests.

## Adding a model

Models are listed in `src/lib/models.ts`. A model must work with the Transformers.js `image-to-text` pipeline and have a license that allows redistribution. Include its approximate download size.

## Security

Report vulnerabilities privately. See [SECURITY.md](SECURITY.md).
