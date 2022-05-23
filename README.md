# ACX UI

Made with ❤️ by the [ACX-UI team](https://jira-wiki.ruckuswireless.com/display/ACX/ACX+-+UI+and+UX).

## One-time setup

### Login

Connect to the VPN and access [your Bitbucket profile](https://bitbucket.rks-cloud.com/profile)
using your RUCKUS login credentials.

[Verify that your account has your username and email address](https://jira-wiki.ruckuswireless.com/display/Team/New+Hire+Guide+for+Alto+UI?preview=/224689327/224689391/image2021-11-23_11-45-52.png).
Please approach IT if these values aren't set correctly.

### SSH key

Use an existing SSH key or [create a new one](https://confluence.atlassian.com/bitbucketserver0610/creating-ssh-keys-989761219.html)
using your RUCKUS username.

```sh
ssh-keygen -t rsa -C "ruckus.username"
```

Copy the public key using the command below, then [add it to Bitbucket](https://bitbucket.rks-cloud.com/plugins/servlet/ssh/account/keys).

```sh
pbcopy < ~/.ssh/id_rsa.pub
```

### Clone project

Use your preferred Git GUI (e.g. sourcetree) or cli.

```sh
git clone ssh://git@bitbucket.rks-cloud.com:7999/rkscloud/acx-ui.git
```

Configure Git.

```sh
git config user.name "ruckus.username"
git config user.email "ruckus.username@ruckuswireless.com"
```

## Branches and pull requests

Features are developed by branching from master. When a branch is ready for review, pull requests
(PR) are raised. These are done using a combination of commands on the [#ruckus-alto-cicd](https://arris.slack.com/archives/CC04J4E3V)
Slack channel and the Bitbucket UI.

### Creating a branch

This is done on the [#ruckus-alto-cicd](https://arris.slack.com/archives/CC04J4E3V) Slack channel.

```
# ⚠️ Replace ACX-5449 with your JIRA issue number
/alto-ci createfb ACX-5449 acx-ui
```

It takes for a few minutes for the branch to be created. Once it's created, checkout the branch
locally to start your development.

### Commit messages

Commit message need to be prefixed with the JIRA issue number e.g.

```
ACX-5449: initial README for acx-ui
```

### Creating a pull request

Create a PR using the Bitbucket UI. You need at least 1 reviewer to approve the PR before it can be
merged.

### Deleting a branch

After a PR is merged, you should delete the branch. Do this on the [#ruckus-alto-cicd](https://arris.slack.com/archives/CC04J4E3V)
Slack channel.

```
/alto-ci closefb ACX-5449 acx-ui
```

## Project

### Prerequisites

- Node.js v14.19.x ([`nvm`](https://github.com/nvm-sh/nvm) is recommended to manage multiple versions of Node.js in your local dev env)
- Extract RC Cookie extension (see https://jira-wiki.ruckuswireless.com/display/Team/ACX-UI)

Use of [Visual Studio Code](https://code.visualstudio.com/) or any other modern IDEs of your choice will work.

### Installing dependencies

```sh
npm install
```

### Run UI

Execute command below and access the UI at [http://localhost:3000](http://localhost:3000).

```sh
npx nx run main:serve --devRemotes=rc-wifi
```

### Run tests

```sh
npx nx affected:test
```

### Run lint

```sh
npx nx affected:lint
```

### Run Storybook

```sh
npx nx run common-components:storybook
```

### Other Nx commands

Refer to [Nx.md](Nx.md) for other Nx related commands.
