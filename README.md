# Handow - e2e BDD test tool for webapp

Online demo:

[Static view of a Handow UAT report](http://www.handow.org/assets/reports/plan/index.html)
[The SHM server - a Handow implementation](http://demo.shm.handow.org/reports)

Handow is a tool or library to generate E2E test project (e.g. UAT) for browser-oriented apps.

> The project name comes from "Hand Shadow" to show respect to [Puppeteer](https://pptr.dev/), and wish users play E2E test easily.

## Features

+ Gherkin syntax compatible
+ Chrome/Chromium orentied, driven by Puppeteer engine
+ Complete JavaScript programming
+ Create test suites rapidly without coding (or a little bit), basing on built-in steps library
+ Schedule test with plans and arrange stories with sequential stages
+ Fast running, execute story groups in parallel by multi-workers
+ Built-in single page report render
+ Cover page view, REST API and cookies testing
+ Cooperate with the test server extension - [SHM project](https://www.npmjs.com/package/handow-shm)

Go the [Handow Site](http://www.handow.org) for more details.

## Install and Usage

Make sure [Node.js](https://nodejs.org/en/download/) has been installed to your local machine.

```
$ npm install handow
```

OR

```
$ yarn add handow
```

Handow support creating UAT project in 2 ways. The recommended mode is calling Hoandow CLI. In this case the test project is created to provide steps, stories and plans. Handow will run the test material as a consumer. Handow can also provide APIs called by test script, just as a node module.

![#f03c15](https://via.placeholder.com/15/f03c15/000000?text=+) **Actually most users prefer to clone the seed project** [handow-seed](https://github.com/newlifewj/handow-seed), and run test with Handow-SHM server and UI.

### Handow CLI

Handow CLI can explain itself.

```
$ npx handow --help
> Handow CLI (with npx runner):   $ npx handow --[task] [target-path]

> --[task]                --plan          Run specific plan, followed by a plan path
>                         --story         Run specific story, followed by '.feature' story path
>                         --parsestory    Parse story or stories to suite(s), followed by stories directory or '.feature' story path
>                         --buildstep     Build steps by specific custom step path, followed by custom steps path
>                         --help          Show CLI help, default task

> [target-path]             Target path relative with app root if target required for the task

> Examples:                 [root-path]/$ npx handow --plan /project/myPlan
>                           [root-path]/$ npx handow --buildstep
```

Handow can also be called by **npm script**, e.g. script property defined in _package.json_ of the test project.

```json
{
    "scrpits": {
        "myPlan": "handow --plan /project/myPlan"
    }
}
```

Then call Handow with npm runner:

```
$ npm run myPlan
```

### Handow API

Handow methods:

#### handow.runPlan(plan, workers)

Run a plan with specific workers.

```
@plan {string} path of a plan file
@workers {integer} number of browser contexts running in parallel
```

After _handow.runPlan(plan, workers)_ finished successfully, test report is generated and rendered basing on project config.

#### handow.runStories(storyPath, workers)

Run one or multiple stories with specific worker. (Handow arrange stories with a internal plan and run it)

```
@storyPath {string} path of a story file or directory contain stories
@workers {integer} number of browser contexts running in parallel
```

#### Example

```js
const handow = require('handow');
const fooPlan = `${__dirname}/project/plan/myPlan`;

handow.runPlan(fooPlan, 4);
```

## Documentation and demo project

[Handow documentation](http://www.handow.org/documents)

[A seed project](https://github.com/newlifewj/handow-seed) showing how to scaffold, maintain and run an UAT project.


