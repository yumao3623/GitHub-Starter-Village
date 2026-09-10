export const officialSources = {
  glossary: {
    title: "GitHub glossary",
    url: "https://docs.github.com/en/get-started/learning-about-github/github-glossary",
  },
  repository: {
    title: "About repositories",
    url: "https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories",
  },
  account: {
    title: "Getting started with your GitHub account",
    url: "https://docs.github.com/en/get-started/onboarding/getting-started-with-your-github-account",
  },
  security: {
    title: "About two-factor authentication",
    url: "https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/about-two-factor-authentication",
  },
  recovery: {
    title: "Configuring two-factor authentication recovery methods",
    url: "https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication-recovery-methods",
  },
  remote: {
    title: "About remote repositories",
    url: "https://docs.github.com/en/get-started/git-basics/about-remote-repositories",
  },
  desktop: {
    title: "Cloning and forking repositories from GitHub Desktop",
    url: "https://docs.github.com/en/desktop/adding-and-cloning-repositories/cloning-and-forking-repositories-from-github-desktop",
  },
  codespaces: {
    title: "Quickstart for GitHub Codespaces",
    url: "https://docs.github.com/en/codespaces/quickstart",
  },
  issues: {
    title: "About issues",
    url: "https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues",
  },
  reviews: {
    title: "Giving reviews",
    url: "https://docs.github.com/en/pull-requests/concepts/giving-reviews",
  },
  actions: {
    title: "Workflow syntax for GitHub Actions",
    url: "https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax",
  },
  artifacts: {
    title: "Workflow artifacts",
    url: "https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts",
  },
  releases: {
    title: "Releasing projects on GitHub",
    url: "https://docs.github.com/en/repositories/releasing-projects-on-github",
  },
  community: {
    title: "Setting up your project for healthy contributions",
    url: "https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions",
  },
  git: { title: "Git reference", url: "https://git-scm.com/docs" },
  gitGlossary: { title: "Git glossary", url: "https://git-scm.com/docs/gitglossary" },
  node: { title: "Download Node.js", url: "https://nodejs.org/en/download" },
  npmInstall: { title: "npm install", url: "https://docs.npmjs.com/cli/v11/commands/npm-install/" },
  npmRun: { title: "npm scripts", url: "https://docs.npmjs.com/cli/v11/using-npm/scripts/" },
} as const;

export type OfficialSourceKey = keyof typeof officialSources;
