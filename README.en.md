# GitHub Starter Village

## Desktop candidate (Phase D)

Phase D adds recording presets, local portrait/landscape sharing, original character action vignettes, quiet opt-in sound, and versioned desktop ZIP/checksum generation. Public desktop downloads are **not available yet**: Developer ID/notarization, Windows signing and clean-system acceptance remain release gates. The README does not link to fake release assets. See [Phase D evidence](docs/product/PHASE_D_PROGRESS.md) and [download guide](docs/setup/DOWNLOAD_APP.md).

Names/URLs live in `src/config/brand.json`; platform publication status in `distribution.json`; desktop identity in `desktop.json`. Sponsorship remains disabled. This work does not authorize a GitHub push or Release upload.

A Chinese-first, game-based course that teaches the complete beginner journey from signing in and forking a real repository to opening and merging a first safe pull request.

## Start here

The main learner guide is in Chinese: [docs/START_HERE.md](docs/START_HERE.md).

This project does not provide a GitHub login screen, collect credentials, connect GitHub OAuth, or call the GitHub API. Passwords, personal access tokens, SSH private keys, two-factor codes, and recovery codes must never be entered into this project.

## Run locally

Install Node.js 22 or newer, then run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Course model

The README is chapter zero. Fourteen chapters cover repository navigation, project evaluation, notifications, issues, Git remotes, branches, commits, pull requests, reviews, Actions, releases, and community health. The capstone happens only inside the learner's own fork by default.

Content is source-backed and validated with:

```bash
npm run content:validate
npm run content:coverage
npm run content:sources
```

## Independent project notice

GitHub Starter Village is an independently developed open-source learning project. It is not an official GitHub product and is not affiliated with, authorized by, or endorsed by GitHub, Inc. GitHub and related trademarks belong to their respective owners.

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and the [MIT License](LICENSE).
