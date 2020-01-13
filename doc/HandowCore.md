# Understand Handow Core

Users write literal stories and maybe a few custom steps, then they make a plan (easy JSON file) and run the plan. Handow will perform test automatically, output info to console (even output to socket stream) and generate records as test result.

## Handow doesn't handle everything

The UAT tool can do nothing before you created test stories (maybe need some custom steps) and wrote a plan - even it is Handow. However, after user did his job well, Handow can handle other things automatically. Basically, just need run the plan with CLI, or a script, or through Super UI. E.g., enter CLI command to shell:

    >handow --plan --/project/myPlan

## Make a plan

A plan is a JSON file like that

```json
{
    "title": "Sinff test for critical feature",
    "stages": [
        {
            "stage": "Head stage",
            "description": "These tests cases must be evaluated before others because ...",
            "stories": [ "story1" ]
        },
        {
            "stage": "Main stage 1",
            "description": "Run all main feature stories [2,3] in parallel",
            "stories": [ "story2", "story3" ]
        }
    ],
    "config": {
        "consoleOutput": "none",
        "newIncognitoContext": true,
        "headlessChromium": true,
        "workers": 5
    }
}
```

The content of the plan explain itself well.

The **planRunr** import the JSON plan directly as plan object.

> The _config_ items can override system configuration, valid for current plan especially.

## CLI interfact - handow.js

User use CLI run Handow functions.

    CLI syntax: handow --[task] --[target(s)], e.g.:

    >handow --plan --/test/sniff        // Run a plan, plan file is [app-root]/test/sniff.json
    >handow --story --/test/random/DeeplinkReportCards.feature      // Run story 'DeeplinkReportCards'
    >handow --story --/test/random      // Run all stories directly in '[app-root]/test/random' folder
    >handow --parsestory --/test/random/DeeplinkReportCards.feature      // Parse story 'DeeplinkReportCards'
    >handow --parsestory --/test/random      // Parse all stories directly in '[app-root]/test/random' folder
    >handow --buildsteps --/test/custom-steps   // rebuild handow steps with custom steps in specific path
    >handow --help  (or any undefined handow command)   // Print out CLI help

>Handow also provide a server and Super UI to invoke similar tasks.

## planRunr - the Plan Runner

```js
const planRunr = require('./planRunr');
const plan = { /* plan object */ };

// Run a plan with 3 workers
planRunr(plan, 3);
```

+ Handow pass the plan object to **planRunr**.
+ The **planRunr** prepare running env, e.g. merge configuation, init reports folder, archive history, starting console output ...
+ The **planRunr** will rebuild all steps available for current running.
+ Then **planRunr** start run the 1st stage (a group stories), and stage by stage ...
+ Before run a stage, **planRunr** parse all stories in current stage group into story objects - **Suites**.
+ The **planRunr** will figure out how many **workers** permitted to run stories in parallel, then choose relevent suites feed workers and run by call **Suite Runner**.
+ Before put a story to Suite Runner, **planRunr** parse the story file into an object - a suite object, and then run the suite.
+ Once a suite is finished, the **SUITE_FINISHED** event trigger **planRunr** put a waiting suite to run until all suites in current stage are ran out.
+ Once all stories in current stage are finished, **STAGE_FINISHED** event is emitted and the **planRunr** start run next stage until all stages are ran out.
+ At the point of last stage finished, plan is finishing. **planRunr** will process record file, output to console ... and open local html page show the test result.

Along with running, **planRnnr** write test info continuously into internal record object, which will be saved as report file in JSON format.
The **planRunr** also output realtime info to console (if enabled), and to socket (if **planRunr** is called by Handow Server).

## suiteRunr - the Suite Runner

```js
const suiteRunr = require('./suiteRunr');
const suite = { /* a suite object */ };

// Run a suite - a story in object format
suiteRunr(suite);
// suiteRunr is an async function ( e.g. await suiteRunr(suite);). But planRunr doesn't call like this
```

The **suiteRunr** is called to run a story, **planRunr** can open mulitple **suiteEunr** to run stories asynchrously. Actually, **suiteRunr** doesn't run story, instead it run a suite object. However, the story-suite convertion is handled by **suiteRunr** in run-time. So we can say **suiteRunr** consume story files direcly.

A suite object is another format of story, from user friendly literal to program friendly object data. It organize all steps, parameters, looping and skipping logic easy for **suiteRunr** consuming.

+ The **planRunr** call **suiteRunr** run a story, and, if multiple workers specified, can open other suite runner without waiting it finished.
+ Interacting with browser need a lot of waiting time to sychronize view updating. When one suite is waiting, other suite runners will continue their work. Multiple workers play suite testing in each other's waiting slot to avoid CPU idle. That't the key point of Handow.
+ The **suiteRunr** will create a new browser context instance and run test on it. Multiple runner will open multiple browser context instances, that's why a group of suites can run in parallel (if not consider data conflict).
+ After new browser instance created, **suiteRunr** will iterate and conpute parameters in suite to run phases and steps one by one until finish them all.
+ Suite runner doesn't run steps directly. It iterate parameter looping, evaluate the skip condition on current parameters to call **stepRunr** continue running.
+ The **suiteRunr** run phases and steps in synchronous way - no parallel inside a suite executing.
+ Then **suiteRunr** close the browser and emit '**SUITE_FINISHED**' event with suite object as parameter.
+ Along with pahses and steps processing, suiteRunr also interact with the **record** to generate test data object, including taking screen shot.
+ Also output to console ... (output to socket ...)

> Handow provide **--parsestory** command to convert story to suite and save suite object as a JOSN file.

> Up to now, Handow doesn't spawn process to run multiple **suiteRunr**. Instead they are executed with node non-blobking mechanism.

## stepRunr - the step runner

```js
const step = { /* the step object from suite */ };
const sdata = { /* parameters valid in current story context */ }
const page = { /* the prowser context instance opened in current story */ }
const config = { /* the system config data computed in current story */ }

const _result = await stepRunr( step, sdata, page, config );
```

The **suiteRunr** process the suite object, loop with story parameters, evaluate skip condition, ... However, it doesn't run the steps - the real test operation basing on pptr. Once **suiteRunr** come to and make decision to execute a step (either Act or Fact), it will invoke **stepRunr** to run the step.

Actually the **stepRunr** doesn't run the step too, it will find out the step object from the **ste-bundle** repository and let step run itself (by its _doStep()_ method). The task of the **stepRunr** is introduce current suite context (parameters, pptr instances, record and outputing flow ...) to the step. Make the abstract step running in current environment. So we can say the **stepRunr** instantiates the step.

+ The **suiteRunr** pass target step and env data to **stepRunr**.
+ The **stepRunr** will find out the step object from step-bundle repository by label matching.
+ The arguments of the step from bundle repository use general reference. **stepRunr** will resove the mapping beteen them and current story parameters.
+ Then **stepRunr** call step's _doStep()_ method. All steps need access **page** and **config** object, they are passed to _doStep()_ too.
+ Besides apply current data to call _doStep()_ method, **stepRunr** also instantiate the general step label to **populated step title**, so that steps have titles with solid meaning.
+ After the step finished, **stepRunr** return result including status and populated step title, and also an Error object when step failed. The result back to **suiteRunr** (the caller) and feed further process, e.g. write to record object.

## stepsBundle - repository for all available steps

There are 2 bundle files locate at **[app-root]/stepBundles/** folder, _actBundles.js_ and _factBundles.js_. They are generated after Handow build steps by compile Handow built-in steps together with custom steps. Handow will rebuild steps before each test running.

The steps, either Handow built-in or user custom steps, they are just snippet code. Handow compile them into generalized objects and bundled into 2 bundle files. Then they could be instantiated to real step by injecting into real parameters.

> Mostly we can not run a single step because they need set app in browser with correct status and with valid parameter, config data ... If we do need test a step, it is possible to write a simple story including this step, and then run this story with CLI.

> Actually Handow doesn't run stories technically, it always put stories in an internal plan and run the plan.

## record

The service to generate a record object along with test running, and save it as a JSON file. The record file name protocol is: 

    [plan-name]_[timestam].json         // e.g. myPlan_1573925791416.json

Handow link the screenshots (if config enable it) file name into record automatically. That means the JSON file is all we need to render the html reports. The screenshot file names protocol:

    [story-name]_[timestamp].[jpg|png|...]  // e.g. exampleStory_1573925546782.png

+ user can specify a path to contain reports.
+ user can specify the image format of the screen file.
+ user can specify archive reports and the max archives reserved.

When Handow start running a plan, it always archive current reports and the clean them from repots directory. There is a folder **[report dir]/archives** in reports directory for history archive. Each test history is archived into a folder named same as its JSON record name.  E.g.:

    --/reports
        |--archives
        |   |--myPlan_1573925791416 
        |           |. myPlan_1573925791416.json
        |           |. story_1573925546782.png
        |           |. ...
        |

## honsole - handow's console printer

It is called in test running to output test info and result to console.

We can config output mode beteen "story", "step" and "none". ("story" is the default mode).

+ "story" mode will show plan stage, story status and a progress bar, finally show the result summary.
+ "step" mode will show a stream for each step status (we can choose showing @skip phase/step or not). The steps info are wrapped by story, phase and looping indicator. Finally show the result summary.
+ "none" just show result summary after plan finished.

> Showing steps stream info just make sense when we run a single story or a few stories with a single worker. The steps are interlaced not readable when we run multiple stories in parallel.

##  HTML Render
