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
ssh-keygen -t rsa -C "commscope.username"
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
git config user.name "commscope.username"
git config user.email "commscope.username@commscope.com"
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

To automatically prefix your message with the JIRA issue number, use a Git hook:

```
cp tools/dev/prepare-commit-msg .git/hooks/prepare-commit-msg
```

### Creating a pull request

Create a PR using the Bitbucket UI. You need at least 1 gatekeeper to approve the PR before it can be
merged.

**Gatekeepers by region:**

- **TDC:** James, Karen, George, Ann, Cherry, YC, Jacky, Jeffery, Peter, Bess, Joe, Amy, Roil, Jerry.
- **SGDC:** Jason, ShiawUen, Mickael
- **BDC:** Suraj, Vivek
- **HQ:** Eric


### Deleting a branch

After a PR is merged, you should delete the branch. Do this on the [#ruckus-alto-cicd](https://arris.slack.com/archives/CC04J4E3V) Slack channel.

```
/alto-ci closefb ACX-5449 acx-ui
```

## Project

### Prerequisites

- Node.js v16.10.0 ([`nvm`](https://github.com/nvm-sh/nvm) is recommended to manage multiple versions of Node.js in your local dev env)
- Extract RC Cookie extension (see https://jira-wiki.ruckuswireless.com/display/Team/ACX-UI)

Use of [Visual Studio Code](https://code.visualstudio.com/) or any other modern IDEs of your choice will work.

### Installing dependencies

```sh
npm install
```

### Run UI

Execute command below and access the UI by logging into
[dev ruckus cloud](https://dev.ruckus.cloud/) and clicking on the Extract RC Cookie extension. UI
will open in a new tab at [http://localhost:3000](http://localhost:3000).

API calls will be proxied to services on devalto (see `apps/main/src/setupProxy.js`).

To proxy to local MLISA services on [https://alto.local.mlisa.io](https://alto.local.mlisa.io) instead,
start the [MLISA dev environment](https://github.com/rksg/rsa-mlisa-helm/tree/develop/dev) first
before executing the command.

```sh
npx nx run main:serve --memoryLimit=4096
```
If you need smoother performance, you can increase the memory limit to `--memoryLimit=8192`.


or for Ruckus Analytics:

```sh
npx nx run ra:serve
```

Use the DEV tool Chrome Extension to copy all Dev cookies to localhost:
  1. Install chrome extension
  - Navigate to `tools/dev/chrome-extract-cookie` to install the extension.
  - You can select the source domain (Dev or other environments) in the extension options. The default is set to 'Dev'.
  2. Use the Extension
  - When you have a valid login session on https://dev.ruckus.cloud/, click the extension button to map the session to localhost.
  - You will see the cookies displayed under the localhost domain.

### Run tests

```sh
npx nx affected:test --coverage --verbose
```

Remove `--coverage` if updating the coverage folder is not needed.

Use command below if you intend to run test for selected packages

```sh
npx nx run-many --target=test --projects=rc,rc-utils --coverage --runInBand --verbose
```

### Check for flaky tests

This project uses [flaky-test-detector](https://www.npmjs.com/package/@smartesting/flaky-test-detector) to identify inconsistent test results. The `./tools/dev/run-flaky-test-detector.sh` script runs updated/added JavaScript/TypeScript test files (`.spec.js`, `.test.ts`, - as determined by `git diff` against `origin/master`) 7 times. And identifies flaky tests based on their XML test output in `./flaky-test-detector-results.xml`.

To detect flaky tests, run:

```sh
./tools/dev/run-flaky-test-detector.sh
```

### Run lint

The `--fix` will help resolve error for simple lint rules.

```sh
npx nx affected:lint --fix
```

### Run tsc validation

```sh
./tools/docker/tscValidator.sh
```

### Run Storybook

```sh
npx nx run common-components:storybook
npx nx run analytics-components:storybook
npx nx run rc-components:storybook
```

### Other Nx commands

Refer to [Nx.md](Nx.md) for other Nx related commands.

### Split.io Feature toggle
Refer to [Feature Flag Operators & Usage in ACX-UI](https://jira-wiki.ruckuswireless.com/pages/viewpage.action?pageId=260188984) wiki on how to make use of feature toggle with Split.io

##### Tool for generating Feature toggle code in R1
From acx-ui/ root directory run following script
```sh
export GIT_OPS_PATH=<path-to-local-gitops-flux-nonbom-repo>
export NONDB_SCHEMA_PATH=<path-to-local-acx-nondb-schema-repo>
node tools/dev/createFF.js -n <toggle-name> -d <description> -t <tags separated by space>
for eg:
export GIT_OPS_PATH=../gitops-flux-nonbom
export NONDB_SCHEMA_PATH=../acx-nondb-schema
node tools/dev/createFF.js -n acx-ui-roaming-type-events-toggle -d "Feature flag for CT roaming type events" -t acx-ui MLSA-8666
```
Note: The script by default refers to local repos `gitops-flux-nonbom` & `acx-nondb-schema` located at the same level of `acx-ui`, hence there is no need to export the repo paths if repos happen to be at the mentioned location.

The script sets default state for `dev` & `int` env as on. 

After successfully running the script the files should be generated in the respective repos locally.

### I18n strings extraction and compilation
Refer to  [Locale.md](Locale.md)

### ACX-UI Unit Test Submodule NX Cache Setup Workflow
https://jira-wiki.ruckuswireless.com/display/Team/ACX-UI+Unit+Test+Submodule+NX+Cache+Setup+Workflow