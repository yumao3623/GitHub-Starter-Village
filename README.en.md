# GitHub Starter Village

## Download and play

Use the [download section in the Chinese README](README.md#下载桌面应用) for the current macOS Apple Silicon package. Windows and Intel Mac downloads are not available yet. The desktop package includes its runtime; players do not need Node.js, npm, or Git. Extract the full ZIP and open the app, rather than downloading the repository's source ZIP.

The current Mac package is ad-hoc signed and **not notarized by Apple**. macOS may block its first launch. If you trust its source and have confirmed it has not been altered, click **Done**, then go to **System Settings → Privacy & Security → Open Anyway** and follow the confirmation prompts. This adds an exception for this app. Do not disable system protection. If the alert says the app is damaged or contains malware, stop and contact the maintainer. See [Apple's instructions](https://support.apple.com/en-us/102445) and the [download guide](docs/setup/DOWNLOAD_APP.md).

A Chinese-first, game-based course that teaches the complete beginner journey from signing in and forking a real repository to opening and merging a first safe pull request.

## Start here

The main learner guide is in Chinese: [docs/START_HERE.md](docs/START_HERE.md).

This project does not provide a GitHub login screen, collect credentials, connect GitHub OAuth, or call the GitHub API. Passwords, personal access tokens, SSH private keys, two-factor codes, and recovery codes must never be entered into this project.

## Run from source (developers)

Install Node.js 22 or newer, then run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Course model

The README introduces the real repository. Thirteen game chapters (0–12) cover repository navigation, project evaluation, notifications, issues, Git remotes, branches, commits, pull requests, reviews, Actions, releases, and community health. The capstone happens only inside the learner's own fork by default.

Content is source-backed and validated with:

```bash
npm run content:validate
npm run content:coverage
npm run content:sources
```

## Independent project notice

GitHub Starter Village is an independently developed open-source learning project. It is not an official GitHub product and is not affiliated with, authorized by, or endorsed by GitHub, Inc. GitHub and related trademarks belong to their respective owners.

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and the [MIT License](LICENSE).
