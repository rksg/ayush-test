
<div align="center">
  ACX UI Project
</div>

<div align="center">

Made with ❤️ by [ACX-UI team](https://jira-wiki.ruckuswireless.com/display/ACX/ACX+-+UI+and+UX)

</div>

<details open="open">
<summary>Table of Contents</summary>

- [Bitbucket](#bitbucket)
    - [Bitbucket login](#bitbucket-login)
    - [Connect to bitbucket repo](#connect-to-bitbucket-repo)
- [Development](#development)
    - [Create a Feature Branch](#create-a-feature-branch)
    - [Commit your development changes](#commit-your-development-changes)
    - [Create a Pull Request](#create-a-pull-request)
    - [Delete the Feature Branch](#delete-the-feature-branch)
- [Project](#project)
    - [Built With](#built-with)
    - [Prerequisites](#prerequisites)
    - [Setting up the project](#setting-up-the-project)
    - [Run UI for development](#run-ui-for-development)
    - [Run tests](#run-tests)
    - [Run lint](#run-lint)
    - [Run Storybook in development mode](#run-storybook-in-development-mode)
</details>

---


## Bitbucket

##### Bitbucket login

1. Connect to the VPN.

2. Access to [Bitbucket account](https://bitbucket.rks-cloud.com/account) with your RUCKUS login credential

3. [Verify that your account has your user name and email address.](https://jira-wiki.ruckuswireless.com/display/Team/New+Hire+Guide+for+Alto+UI?preview=/224689327/224689391/image2021-11-23_11-45-52.png) Please approach IT if these values aren't set correctly.


##### Connect to Bitbucket repo

1. [Setup your SSH keys](https://confluence.atlassian.com/bitbucketserver0610/creating-ssh-keys-989761219.html)
Remember to use the RUCKUS Username (e.g. cc1149). Do not use your commscope email address.


2. Once created and pasted SSH public key under  _User > Account > SSH keys_
    ```sh
    ssh-keygen -t rsa -C "RUCKUS USERNAME"
    ```

3. Use your prefer GIT GUI (e.g. sourcetree) or Cli.


## Development

#### Create a Feature Branch

1. Go to this slack channel. https://arris.slack.com/archives/CC04J4E3V
2. Create a feature branch in the bitbucket repo with the following command.
    ```
    # ⚠️ Replace MLSA-5449 with your JIRA task.
    /alto-ci createfb MLSA-5449 acx-ui
    ```
3. Wait for a few minutes for the branch to be created.
4. Once it's created, checkout the branch locally to start your development.

#### Commit your development changes

1. Add the JIRA number as a prefix to your commit message:

    ```
    MLSA-5449: initial README for acx-ui
    ```
2. Commit and push your branch.


#### Create a Pull Request

1. Create a PR using the Bitbucket UI. You need at least 1 reviewer to approve the PR.

#### Delete the Feature Branch

1. Go to this slack channel. https://arris.slack.com/archives/CC04J4E3V
2. Delete the feature branch in the bitbucket repo with the following command.
⚠️ Replace MLSA-5449 with your JIRA task.

    ```
    /alto-ci closefb MLSA-5449 acx-ui
    ```

## Project

### Built With

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Ant Design](https://ant.design/)

### Prerequisites

- Node.js v14.19.x ([`nvm`](https://github.com/nvm-sh/nvm) is recommended to manage multiple versions of Node.js in your local dev env)
- Extract RC Cookie extension (see https://jira-wiki.ruckuswireless.com/display/Team/ACX-UI-POC)

### Setting up the project

Clone this repo and install dependencies.

```bash
npm install
```

### Run UI for development

Execute command below and access UI at [http://localhost:3000](http://localhost:3000).

```bash
npx nx run main:serve --devRemotes=rc-wifi
```

### Run tests

```bash
npx nx affected:test
```
### Run lint

```bash
npx nx affected:lint
```

### Run Storybook in development mode

```bash
npx nx run common-components:storybook
```

### Misc

To develop on this project, use of [Visual Studio Code](https://code.visualstudio.com/) or any other modern IDEs of your choice will work.

Refer to [Nx.md](Nx.md) for Nx related commands
