# Contributing to Sweet Dreams Bakery

Thanks for helping out. This guide covers how we work on issues in this repo. Please follow it for every change, however small. It keeps reviews quick and `main` green.

## Before you start

1. Make sure your clone is up to date: `git checkout main && git pull`.
2. Install dependencies if `pnpm-lock.yaml` has changed: `pnpm install`.
3. Make sure the app runs: `pnpm dev`, then open http://localhost:3000.

If you're new to the repo, read the [README](README.md) first. The database is SQLite. Run `pnpm db:push` and `pnpm db:seed` if the app shows no products.

## Working on an issue

1. **Pick one issue and assign it to yourself.** Comment on the issue if you're unsure what it asks for.
2. **Create a branch from `main` for that issue.** Name it `<type>/<issue-number>-<short-slug>`, for example `fix/12-preparing-badge` or `feat/14-cart-aria-labels`. Use `fix` for bugs, `feat` for new behavior and `chore` for tooling or docs.
3. **Keep the change scoped to the issue.** Don't refactor neighboring code, rename things or reformat files you didn't need to touch. If you spot something else that needs fixing, open a new issue for it instead.
4. **Add or update tests.**
   - Logic in `lib/` needs a unit test in `__tests__/` (Jest).
   - A change that a user can see or click should be covered by the Playwright tests in `e2e/` where practical.

## Checks to run before you commit

Run these from the repo root, in this order. All of them must pass.

| Step | Command | What it checks |
| --- | --- | --- |
| 1 | `pnpm lint` | ESLint rules |
| 2 | `pnpm typecheck` | TypeScript types |
| 3 | `pnpm test` | Jest unit and component tests |
| 4 | `pnpm test:e2e` | Playwright end-to-end tests (starts the dev server for you) |

If Playwright says the browsers are missing, run `pnpm exec playwright install chromium` once.

To run one Jest test file: `pnpm test -- __tests__/utils.test.ts`. To watch the Playwright run: `pnpm test:e2e -- --headed`.

## Commits

- Use the form `<type>: <summary> (#<issue>)`, for example `fix: show Preparing badge color on My Orders (#12)`.
- Write the summary in the present tense and keep it under 72 characters.
- One logical change per commit. Don't mix unrelated changes.

## Pull requests

1. Push your branch: `git push -u origin <branch>`.
2. Open a PR against `main`. In the description, write `Closes #<issue>` so the issue closes when the PR merges.
3. Fill in the checklist in the PR template.
4. Wait for CI. The **CI** workflow runs lint, typecheck, unit tests and the build. The **E2E** workflow runs the Playwright tests. If CI fails, fix the problem on the same branch and push again. Don't open a new PR.
5. Once CI is green, the PR is ready for review.

## After your PR

Switch back to `main`, pull, and start the next issue on a new branch. Don't build one issue on top of another's unmerged branch unless the issue says it depends on it.
