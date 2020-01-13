# Handow To Do

## Handow Core

The essential functions finshed.

+ Story syntax
+ Step syntax
+ Parse story
+ Build steps
+ Run suite work flow
+ Plan and plan runner
+ Record and history
+ CLI
+ Console output

fix bugs

#### bug

When finishing a plan, console output:

    ERROR: The process with PID 13592 (child process of PID 7320) could not be terminated. ...
    Reason: There is no running instance of the task

Tottally no idea about it. Is it just bug in _terminai-kit_, e.g. the progress bar? But it seems not impact the test result.

### ToDo - syntax for _handow probe attribute_ (almost finished) ?? necessary??

+ define a custom attribute as probe, e.g. _config.htmlProbe == **h4w**_ , so user can add _h4w="profile-username-label"_ to test target element.
+ special selector syntax "**[probe label]@h4w**" will be translated to selector _*[h4w='[probe label]']_.
+ webpack loader and node script filter to clean the h4w attribute from .js or .html source file.

    When I click it {selector: "SubmitButton"}
    
    parameters: {
        SubmitButton: "profile-submit-btn@h4w"
    }

    // Suppose the html is:
    \<button h4w='profile-submit-btn'\>Submit\</button\>

> Never use h4w probe for any other purpose!!!

> Add more syntax sugar to probe???


### ToDo - HTML render (almost finished)


### Todo - Global variable for stories

Parameters in story literal are constant now, and some of them are reused cross miltiple stories and steps. The issue is they are not easy to modified after changed. So, it is possible using a variable-parameter look-up table, then we can refactor the table to change parameters.

> Just `${}` evaluate the parameters in steps?

Actually story literal can refer parameters in 3 ways:

+ the _@parameters_ object of current phase, these parameters are highest priority

### ToDo - IDE cooperating plugins (Eclipse, Intelliji, Vscode)

+ step promotion, cross reference
+ Dummy step generating
+ parameter syntax validation, e.g. missing ','

### ToDo - API test integration

### ToDo - Steps library

+ steps for handow-core
+ steps for Super-UI (more reuse supporting and validation, online verify???)

### ToDo - reuse browser context in same stage? Don't close one and then open a new one

### ToDo - optional showing parameter value in report

### ToDo - micro syntax for steps block reuse

### Todo - story syntax checking and output info in parsestory

### ToDo - parameter highlight in reports step title

### ToDo - Story Editor (editor running in browser with more help functions, not using IDE anymore)

### New CLI after deploy to npm

#### New probe selector for 'contains', e.g. "porfile-title@h4w('My Profi')", to locate elements probed and contains 'My Profi' text.

### make pptr stable (Have solution already)

(Need re-evaluate element before acting)

### JSON, Https status, cookies and cookies in record

+ When make an XHR call, should take care the JSON response (Done)
+ When deeplink an URL, should take care about cookies and http status. (Done)
+ Showing xhr expect probe object in XHR popover 

### Show page exception and errors together with screenshot

Page listen to 'console' event, and record 'srror' type messages, and showing in screenshot player.
(Do it later ...)

## Publish to Github and NPM

+ **handow-core** to npm (and github)
+ **handow-render** to npm (and github)
+ **handow-seed-demo** project to github

Why handow-core doesn't include the render????????? no sense

## Handow server and Super UI

**Handow server and Super UI is not included in Handow core**.

+ Host Handow to server
+ Remote control
+ Socket for real time watching
+ Instrument Panel
+ History listing and rendering
+ History statistics
+ Play test movie
+ !! ilias and trouble shooting on line, save to server database for friendly render and furure error analysis. Good idea??
+ Instrument panel showing stories running in timeline, console showing stream info, choose story filter information, set alarm, break point,
+ web editor to write .feature story, more supporting and intracting than IDE?

## Handow website

## Traning book and video

## UX design tools integration

Create test stories along with UX design. Greate value.


## Test generator by play application??