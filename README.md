# Handow - e2e BDD test tool for webapp

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

## See demo to know Handow

[Rendering example of an UAT report](https://storage.googleapis.com/handow-uat-assets/static/uat-pet-store/index.html)

Clone the project and make sure [install Node.js](https://nodejs.org/en/download/) to you local machine. Then install dependencies under project root, e.g. _handow-core\/_, with:

    $ npm install

Run the built-in demos at project root path:

    $ npm run demostory
    OR
    $ npm run demoplan

## Usage

### Scaffold an UAT project

    npm i handow-core
    # or "yarn add handow-core"

Then call Handow API to handle Steps, Stories and Plans. Run them and render the reports.

```js
// Include handow-core
const handow = require('handow-core');
```

+ Run a test plan with multi-workers, e.g. 4-workers means running 4 stories could be eavaluated in parallel.

```js
// Include handow-core
const handow = require('handow-core');
handow.runPlan(plan, workers);
```

+ Run specific story or stories.

```js
// Include handow-core
const handow = require('handow-core');
handow.runStories(stories, workers);
```

+ Parse a literal story or stories.

```js
// Include handow-core
const handow = require('handow-core');
handow.parseStories(stories, wkrs);
```

+ Build custom steps (The built-in steps are rebuilt in the meantime)

```js
// Include handow-core
const handow = require('handow-core');
handow.buildSteps(customStepsPath);
```

> Handow running in test project depending on a configuration file - _**config.js**_ located in project root. [Handow config]()

### Seed project

Coming soon ...

### Supper Handow

Coming soon ...

The framework 

## Documentation

Coming soon ...