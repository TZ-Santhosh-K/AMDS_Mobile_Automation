# Project guidance

This repository is used for AMDS Mobile Automation. Keep this file as the durable handoff for future ChatGPT/Codex sessions, including when the user switches to their office ChatGPT account.

## Working with the user

- Treat this repository and its current contents as the source of truth; do not assume a previous account's chat history will be available.
- Before making changes, inspect the relevant files and preserve existing project conventions.
- Keep this file current when the user establishes durable project preferences, workflows, or environment details. Record only information useful to future work; do not store passwords, tokens, or other secrets.
- For changes, summarize the files changed and any verification performed.

## Automation preferences

- Keep helpers small and shared; configure test accounts/device IDs through environment variables.
- Fixed OTP is opt-in for matching designated test accounts only; the backend must support it. Do not record account values here.
- Defer CI/CD pipeline integration until requested. Keep physical-device runs serial.
- Local test data lives in ignored `test-data/local.json`; keep only placeholders in `test-data/example.json`. Environment variables take precedence.
- SMS extraction must not depend on a specific brand or message template. Never log inbox bodies or OTP values.
