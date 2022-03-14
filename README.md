
<div align="center">
  ACX UI Project
  <br />
</div>

<div align="center">
<br />

Made with ❤️ by [ACX-UI team](https://jira-wiki.ruckuswireless.com/display/ACX/ACX+UI+and+UX)

</div>

<details open="open">
<summary>Table of Contents</summary>

- [About](#about)
  - [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
    - [Bitbucket login](#bitbucket-login)
    - [Connect to bitbucket repo](#connect-to-bitbucket-repo)
- [Development](#development)
  - [Create a Feature Branch](#create-a-feature-branch)
  - [Create a Pull Request](#create-a-pull-request)
</details>

---

## About

```sh
Coming Soon
```

##### Built With

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Ant Design](https://ant.design/)
- ...


## Getting Started

##### Prerequisites

```sh
Coming Soon
```

### Setup

##### Bitbucket login

1. Connect to the VPN.

2. Access to [Bitbucket account](https://bitbucket.rks-cloud.com/account) with your RUCKUS login credential

3. [Verify that your account has your user name and email address.](https://jira-wiki.ruckuswireless.com/display/Team/New+Hire+Guide+for+Alto+UI?preview=/224689327/224689391/image2021-11-23_11-45-52.png) Please approach IT if these values aren't set correctly.


##### Connect to Bitbucket repo

1. [Setup your SSH keys](https://confluence.atlassian.com/bitbucketserver0610/creating-ssh-keys-989761219.html)
Remember to use the RUCKUS Username (e.g. cc1149). Do not use your commscope email address.
<br/>

2. Once created and pasted SSH public key under  _User > Account > SSH keys_
    ```sh
    ssh-keygen -t rsa -C "RUCKUS USERNAME"
    ```

3. Use your prefer GIT GUI (e.g. sourcetree) or Cli. 


## Development

### Create a Feature Branch

1. Go to this slack channel. https://arris.slack.com/archives/CC04J4E3V
<br/>
2. Create a feature branch in the bitbucket repo with the following command. 
⚠️ Replace MLSA-5449 with your JIRA task. 

    ```
    /alto-ci createfb MLSA-5449 acx-ui
    ```
3. Wait for a few minutes for the branch to be created. 
<br/>
4. Once it's created, checkout the branch locally to start your development.

### Create a Pull Request

1. Add the JIRA number as a prefix to your commit message:

    ```
    MLSA-5449: initial README for acx-ui 
    ```
2. Commit and push your branch.

3. Create a PR using the Bitbucket UI. You need at least 1 reviewer to approve the PR.

### Delete the Feature Branch

1. Go to this slack channel. https://arris.slack.com/archives/CC04J4E3V
<br/>
2. Delete the feature branch in the bitbucket repo with the following command. 
⚠️ Replace MLSA-5449 with your JIRA task. 

    ```
    /alto-ci closefb MLSA-5449 acx-ui
    ```