# AGENTS.md

## Project intent

GitHub Starter Village is a Chinese-first, game-based learning project for complete GitHub beginners. The repository README is chapter zero. Every change must preserve the path from the real GitHub repository to a local working copy and then back to a safe capstone exercise inside the learner's own fork.

## Non-negotiable safety rules

- Never create a fake GitHub login, credential form, OAuth flow, or GitHub API integration.
- Never request or store passwords, personal access tokens, SSH private keys, 2FA codes, or recovery codes.
- Never claim that a real GitHub action was verified without a real, disclosed verification mechanism.
- Never require Star, sharing, sponsorship, or an upstream Pull Request to graduate.
- Keep sponsorship disabled until real assets are supplied by a maintainer.
- Show the independent-project disclaimer in README, About, and the site footer.

## Product rules

- Chinese-first copy, with exact current English UI labels beside explanations.
- Content lives in `src/content`; application components must not duplicate definitions.
- P0 and P1 terms need official sources and 100% mainline coverage.
- P0 terms need an interaction and graduation-test coverage.
- Real GitHub actions use self-check language; simulated actions state that they are game mechanics.
- Default assistance is full Chinese. Learners may reduce help but are never forced.

## Engineering rules

- Next.js App Router, strict TypeScript, static-first, no database, no account system.
- Server Components by default; isolate browser state and event handlers in client leaves.
- Progress uses the versioned storage adapter in `src/core/persistence`.
- Run `npm run content:validate`, `npm run content:coverage`, `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` before merging.
- Use npm in learner-facing instructions.

## Content review

When GitHub UI wording may have changed, verify the exact label against GitHub Docs or the current public interface. Update `lastVerifiedAt`, the source, UI coverage, and any affected screenshots together. Do not label blogs or community posts as official sources.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
