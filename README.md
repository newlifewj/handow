# Handow - Hand shadowing play UAT

User need to do 3 things to use Handow UAT tool:

+ Create stories, e.g. .feature files in _/project/stories/_
+ Add custom steps if they need steps not exisited in built-in step library, e.g. .js files in _/project/steps/
+ Create plans, e.g. .json files under _/project_

## DEMO run

Enter the _/core/_ directory:

    # Run a plan with 2 workers in 2 stages
    .../core> node ./handow --plan --/project/demoPlan

    # Run a single story
    .../core> node ./handow --story --/project/stories/demoStory.feature


Handow CLI

    # Run a plan
    > handow --plan=...

    # Build stories
    > handow --build

    # Build and then run a plan
    > handow --build --plan=...

    # Run s story
    > handow --story=...

Run npm script

    # Run a plan (extra '--' introduce parameter to handow as "process.argv")
    > npm run handow -- --plan --/project/demoPlan

    ...

> **Attention**: A space is required between '--'  and parameter when pass variable to script from npm runner.
    