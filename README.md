# Handow test engine

**handow-core** pacjage is the test engine of Handow - the E2E test tool.

## Features

+ **Playwright** or **Puppeteer** browser driver API
+ Simplified Gherkin syntax for story, scenario and step literal and hooking
+ Built-in step library and custom steps integration
+ Parameter, loop and condition functions
+ Report and static report render
+ CMD interface

## Install and Usage
Make sure [Node.js >= v12.0](https://nodejs.org/en/download/) has been installed to your local machine.

```
$ npm install handow
```

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

![#f03c15](https://via.placeholder.com/15/f03c15/000000?text=+) Users can implement **handow-core** solely or include it in their own applications as an API privider. It is recommended to run **handow-core** with **handow-shm** (Handoe Manageent Server), please clone the Handow Seed to get an [out of the box project with demo](https://github.com/newlifewj/handow-seed).


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


