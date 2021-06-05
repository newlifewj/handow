# Access handow-core solely

Normally users install the full Handow by clone the [out of the box project with demo](https://github.com/newlifewj/handow-seed). In this test engine (**handow-core**) is manipulated by the test server and UI (**handow-shm** package). But users can also run **handow-core** solely in command line interface without **handow-shm** package.

## Run handow-core after install it as a node_module package

Assuming the **handow-core** was install in a direcoty (e.g _handow/_), like this:

```
handow
    |
    |--- node_modules               // handow-core has been installed as node module packae
```

Users add the test project folder, the default test project path is _{appRoot}/project_
```
handow
    |
    |--- node_modules               
    |--- project                    // default project path
    |       |--- params
    |       |--- stories
    |       |--- steps
    |       |--- fooPlan.plan.json
```

Users can add a custom config file to override the default configuration in **handow-core**:

```
handow
    |
    |--- node_modules               
    |--- project                    
    |--- config.js                  // custom config file
```

The default config properties in **handow-core**:

```js
 {
    // App root path, so that we just need use relative path in project.
    _rootPath: `${appRoot}`,

    // Only for test, render JSON data to html
    _testLocalJSON: false,

    // Wait all XHR resolved after each action step or not, default is true - resolve all XHR after each action before taking screenshot. 
    actResolveXHR: true,

    // Copy current report files to ./archives folder. If history reports are more than 30, then remove the oldest one.
    // autoArchive: 30,
    autoArchive: false,

    // Browser session scope, default 'plan' is all stories in the plan share same browser session. "story" - each story launch new browser context
    browserSessionScope: "plan",

    // Monitor test output by console: "story" | "step" | "none", "story" is the default.
    consoleOutput: "story",

    // Add cookies info to report or not. true -- will add cookies available for current page path to each act
    cookies: false,

    // Timeout for waiting element appear, default is 30000.
    elementAppearTimeout: 30000,

    // Timeout for verify element nonexistent, default is 10000.
    elementAbsentTimeout: 10000,

    // Enable micro phase syntax
    enablePhaseMicro: false,

    // The path where global parameters are defined, e.g. /project/params/ (relative with app-root).
    globalParams: 'project/params',      // globalParams===false means "no".

    // Dedault using local real Chrome, but need to be "true" in customconfig or run on Linux ...
    headlessChromium: false,

    // Handle a probe when process parameter selector, default is false, 
    htmlProbe: "h4w",

    // local html render, set up HTML render and relavant resource
    localRender: true,

    // After test finished and store the record, open browser show result automatically.
    localAutoRender: true,

    // Timeout for browser navigating complete, e.g. the document is loading
    navigatingTimeout: 3000,

    // Output and record phase/step skipping info, default is false
    outputSkipInfo: false,

    // Add errors happened currently to report or not. true -- Will add errors existed in current page to each act
    pageErrors: false,

    // Test project root, defaut is {rootPath}/project
    projectPath: "project",

    // The tile of local render, format is "projectTitle" - {the plan name}
    projectTitle: "UAT Reports",

    // Reacting time (ms) after each Act steps but before taking screenshot
    reactTime: 300,

    // Report data path (including screenshots). defaut is {rootPath}/project/records
    reportPath: "project/records",

    // save record as JSON or not - even false, Handow also save a JSON file, but it's empty
    // saveJsonReport: true, always save json result file.

    // If screen set to boolean false, No Screenshot. Otherwise Handow take screenshot after each act step.
    screenshot: true,

    // Suites number showing in one line for suites running console output
    showSuitesPerLine: 7,

    // Custom steps path, will be overridden by application config or plan config, defaut is {rootPath}/project/steps
    stepsPath: 'project/steps',
    
    // storyfiles path, will be overridden by app config, defaut is {rootPath}/project/stories
    storiesPath: 'project/stories',

    // If screen touched
    touchScreen: false,

    // Behavior on "no step in lib" for a story step literal.
    undefinedStep: "break",     // "break|continue", defualt "break" will terminate test running immediatelly.

    // Viewport could be destop, mobile or set "width x height", default is "800 X 600"
    viewport: "desktop",    // desktop: 1440x800

    // pptr workers - how many browser contexts could be launched for testing suites in paraller
    workers: 4
}
```
### Run handow with package runner - npx

After created test steps, stories and plan in test project, you can run handow on the test resources with **npx**, e.g.:

```
$ npx handow --help
$ npx handow --buildsteps
$ npx handow --story --/project/stories/ExampleStory.feature
$ npx handow --plan --/project/ExamplePlan
...
```

### Run handow with npm scripts

Can also add the _package.json_ file, run handow with npm scripts:

```json
"scripts": {
    "help": "handow --help",
    "buildsteps": "handow --buildsteps",
    "ExampleStory": "handow --buildstep && handow --story project/stories/ExampleStory.feature",
    "ExamplePlan": "handow --buildstep && handow --plan project/plan/ExamplePlan"
}
```

## Run handow-core source project

You need to clone the source code of **handow-core** instead of install the npm package if you want to customize it. Then you creat a test project and install the **handow-core** source project as a npm package to your test project.

The local test project, e.g., the _/local-test_ folder:

```
local-test
    |--- project            // test project directoty
    |--- records            // Reports directory
    |--- config.js          // config file 
    |--- pacakge.json       // 
```

Add local **handow-core** files as npm module in _package.json_ (assuming the handow-core source folder is sibling of the _local-test_ folder)

```
"devDependencies": {
    "handow": "file: ../handow-core"
}
```

Install the local **handow-core** folder as soft link in the _node\_modules_ of _local-test_:

```
local-test> npm install
```

And also, you need add _project_ and _records_ folders and _config.js_ file as soft link in **handow-core** directory and point the relevant folders and file in _local-test_.

Than you can run handow under _local-test_ path just like the **handow-core** package is installed, but now you can develop **handow-core** locally without push it to npm repository.

## Call APIs of handow-core

Install **handow-core** and import it to youe application, the call Handow APIs by your scripts:

```js
const handow = require("handow");
handow.runPlan(examplePlan, 3);         // Run specific test plan with 3 workers
```

The APIs provided by **handow-core**, refer to [Handow APIs]()

```js
{
    runPlan: runPlan,       // runPlan = (plan, workers) => {}
    runStory: runStory,     // runStory = (story, workers) => {}
    stop: stop,
    parseStories: runParseStories,
    buildSteps: runBuildSteps,
    buildTree: runBuildTree,
    handowStatus: getHandowStatus,
    setRunningStatus: setRunningStatus     // Only called by http call from native running, set to process.id or null
};
```



