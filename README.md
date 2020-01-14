# Handow - e2e BDD test tool for webapp

[A simple Handow UAT report example](https://storage.googleapis.com/handow-uat-assets/static/uat-pet-store/index.html)

There is no doubt that any program should be developed along with testing projects. There are so many testing types, framworks and tools. Each of them helps us in some way or another, and also has its specific drawbacks. If only one is allowed to deploy for our developing application, unfortunately it is usually, I will pick an e2e type UAT. Because a duck test can cover the whole application and, wothout surprise, it is usually the customers requirement. Handow is a tool and library to generate UAT project for browser oriented apps.

> Project name comes from "Hand Shadow" to show respect to [Puppeteer](https://github.com/puppeteer/puppeteer) project, and also a goodwill to play UAT easily.

## Features

+ Gherkin syntax compatible
+ Chrome orentied with Puppeteer driver
+ Complete JavaScript programming
+ Create test rapidly without coding (or a little bit code) basing on built-in steps library
+ Schedule test with plan and plan runner
+ Fast running by parallel stories with stages
+ Built-in single page report render
+ Cover page view and REST API testing

Even more features like parameters conditional looping, run-time skipping, micro your literals... Please the [Handow Site](https://docs.google.com/document/d/1rFdsDl7wZGsR47kMsQ28ki3OlAx9nVLl6fUmo2u198c/edit#heading=h.gfbuevxpquop).

## Install and Usage

Make sure [install Node.js](https://nodejs.org/en/download/) to you local machine.

```
$ npm install handow
```

OR

```
$ yarn add handow
```

Handow support creating UAT project in 2 ways. The recommended mode is calling Hoandow CLI. In this case the test project is created to provide steps, stories and plans. Handow will run the test material as a consumer. Handow can also provide APIs called by test script, just as a node module.

### Handow CLI

Handow CLI can explain itself. 

```
[root-path] $ npx handow --help
> Handow CLI (with npx runner):   & npx handow --[task] [target-path]

> --[task]                --plan          Run specific plan, followed by a plan path
>                         --story         Run specific story or stories, followed by stories directory or '.feature' story path
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

    @plan {string} path of a plan file
    @workers {integer} number of browser contexts running in parallel

After _handow.runPlan(plan, workers)_ success finished, test report is generated and rendered basing on project config.

#### handow.runStories(storyPath, workers)

Run one or multiple stories with specific worker. (Handow arrange stories with a internal plan and run it)

    @storyPath {string} path of a story file or directory contain stories
    @workers {integer} number of browser contexts running in parallel

The test report is generated and rendered according to configuration after success.

#### Example

```js
const handow = require('handow');
const fooPlan = `${__dirname}/project/plan/myPlan`;

handow.runPlan(fooPlan, 4);
```

## Documentation

[Handow Site](https://docs.google.com/document/d/1rFdsDl7wZGsR47kMsQ28ki3OlAx9nVLl6fUmo2u198c/edit#heading=h.gfbuevxpquop). _(coming soon ...)_

### Seed project

[A seed project](https://github.com/newlifewj/handow-seed) showing how to scaffold an UAT with Handow and how to run it. Start new test project by clone it and know Handow by demo.


## Shandow - Super Handow Extension

In design stage.