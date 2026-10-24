# Security policy

## Reporting a vulnerability

Please report security issues privately through GitHub's
[private vulnerability reporting](../../security/advisories/new) on this repository.
Do not open a public issue. Expect an acknowledgement within a few days.

## Data handling

- Images are processed entirely in your browser. They are never uploaded, stored or logged by this project.
- The app has no backend, accounts, cookies or analytics.
- The only network requests after the page loads are model downloads from Hugging Face.
- There are no API keys or secrets in this project.

## Practices

- A Content Security Policy, set through response headers, limits scripts, workers and network connections to this site and the model hosts.
- Model output is rendered as text by React, never as HTML.
- Uploads are limited to common image types and 10 MB.
- Dependencies are updated through Dependabot, and CI runs lint, type checks, tests and a build on every pull request with read-only repository permissions.
- Commits follow Conventional Commits, and Git hooks run checks before commit and push.
