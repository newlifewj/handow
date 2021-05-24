# Handow To Do

## Handow Core - ToDo

The essential functions finshed.

### Prediction in testing (Or add a config item for this feature??)

+ If the **Given** scenario failed, should ignore all scenarios after it **in this loop** by set all actions and verifications to be **skipped**. -- not skipped, set broken and failed?
+ If an action of a **When** scenario failed, should ignore all following steps after it **in this scenario** by set actions and verifications to be **skipped**.
+ So that we can avoid testing basing on wrong situations.
+ The **Given** and **When** steps failure is "Broken"

> Make "broken" break current story. One a "broken" failure happened, auto-skip all following scenarions and steps. That need record skipped steps and scenarios and show them in report, we don't have it now!!

### bugs

When finishing a plan, console output:

    ERROR: The process with PID 13592 (child process of PID 7320) could not be terminated. ...
    Reason: There is no running instance of the task

Tottally no idea about it. Is it just bug in _terminai-kit_, e.g. the progress bar? But it seems not impact the test result.

### Micro statement

Handow provide built-in steps library, users can create their story by referring built-in steps without writing step code (or just a little bit custom steps). That is a greate help for generating reliable test project rapidly. But using built-in steps has some drawbacks:

+ Most built-in steps are "tiny" operations and verifications. It looks like a little bit verbose for story literal and report presenting if they are implemented in story statements.
+ The built-in steps user general and abstract label. However user, customer especially, would like the stories and reports are related with current bussiness.

Handow provide **micro** mapping syntax to re-labeled one or multiple steps. The story statements could be **Micro Steps** and they will reflect to reports too. So that user can get more readable stories and reports.

Micro processing only happen in story parsing and reports generating stages.

+ Micro statements will be parsed to normal steps in story parsing stage.
+ Then they are executed exectly like none-misro stories
+ After report generated, Handow need additional process to refactor the normal reports to **micro style** reports - for stories implemented micro statements.

### Selector Xpath probe automatically

> This must be finished before adding more built-in steps. And all the existing steps need to be refactored.

User needn't choose **selector steps** or **xpath steps** when he implement **Probe** to locate elements. Handow step will ayalisis the probe syntax and decide invoking correct method.


### Add more built-in steps

Add 50 essential steps.

> Must considering about selector-xpath automatic and how to colaborate with **SHandow Story Editor**.


### ToDo - IDE cooperating plugins (Eclipse, Intelliji, Vscode)

+ step promotion, cross reference
+ Dummy step generating
+ parameter syntax validation, e.g. missing ','

> Not necessary if SHandow is good for story editing

### Use device list to initial browser view port

### Firefox support, pptr suports Firefox now, but I don't think is worth do this.

Add properties to _config and override it in plan:

{
    device: "desktop", // "desktop lg" | "iPhone 7" | "Kindle Fire HDX landscape" | ...
    browser: "Chromium" // "Firefox", "Chrome" ...  // Is it necessarilly???
}

### Story validation cannot handle comma missing in @parameters


## Story timeout to fix the story infinite blocking

When a story start, set a timer for it e.g. 10 minutes, If a story last more than 10 minutes, it is terminited immediately!

## Make sure clear all browsers launched in current machine

Once a browser is launched, we remember the references to a global list. Once test finished or abort by any reason, we need to iterate this browser list to make sure they are closed.



