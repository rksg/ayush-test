# ACX UI POC

### Prerequisites

- Node.js v14.19.0 ([`nvm`](https://github.com/nvm-sh/nvm) is recommended to manage multiple versions of Node.js in your local dev env)
- Extract RC Cookie extension (see https://jira-wiki.ruckuswireless.com/display/Team/ACX-UI-POC)

### Setting up the project

Clone this repo and install dependencies.

```bash
npm install
```

### Run UI for development

Execute command below and access UI at [http://localhost:3000](http://localhost:3000).

```bash
npm start
```

Login to RC environment and click on the Extract RC Cookie extension.

### Run tests

```bash
npm test
```

### Run Storybook in development mode

```bash
npm run storybook
```

### Misc

To develop on this project, use of [Visual Studio Code](https://code.visualstudio.com/) or any other modern IDEs of your choice will work.
