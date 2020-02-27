# Handow To Do

## Developing plan

+ @On Borad@ **Handow Site** documentation feature
+ @On Borad@ **Document** files and reference solution
+ @On Borad@ More **Built-in Steps** (consider about micro, selector/path automatoc and SHandow story editor, 50 in first stage??)
+ Add **Micro Step** feature to Handow core
+ **Shandow** story editor feature  (or create IDE pluggins???)

> After these things, hopely Handow could be an usable tool. Then we can think about how to spread it to community.

## Handow Core - ToDo

The essential functions finshed.

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

### Add @tags to story for report fiter

Tags are added to each story, so that we can filter stories to groups. The **failed** and **passed** 2 tags are added automatically after story testing finished.

### Merge Given and When steps

Must finish before **Add more built-in steps**

### @Made progress already@ Add more built-in steps

Add 50 essential steps.

> Must considering about selector-xpath automatic and how to colaborate with **SHandow Story Editor**.

### Show page exception and errors together with screenshot

Page listen to 'console' event, and record 'error' type messages, and showing in screenshot player.
(Do it later ...) -- necaeesay??

### ToDo - IDE cooperating plugins (Eclipse, Intelliji, Vscode)

+ step promotion, cross reference
+ Dummy step generating
+ parameter syntax validation, e.g. missing ','

> Not necessary if SHandow is good for story editing


### ToDo - reuse browser context in same stage? Don't close one and then open a new one ????????

### Todo - story syntax checking and output info in parsestory ????????

> Not necessary if SHandow is good for story editing


### make pptr stable (Have solution already)

(Need re-evaluate element before acting)


## Handow server and Super UI - Super Handow (SHandow)

**Handow server and Super UI is not included in Handow core**.



+ !! ilias and trouble shooting on line, save to server database for friendly render and furure error analysis. Good idea??

+ web editor to write .feature story, more supporting and intracting than IDE?

## Handow Site

+ Documentation
+ User monitor
+ Super Handoe authorization
+ paypal donation
+ get a domain, how about handow.com?

## Super Handow - Not included in Handow core

Super Handow is not open source project, user need download and install it. We remtain the right to charge fee. Maybe we need a solution to encourage user pay anual fee (e.g. popover reminder to expired user).

SHandow installed with authentication, so we know who is expired. The authen-center is a feature of **Handow Site**. 

> The main part of SHandow is published to npm, but it need a **key-booting** routine to run. The **key-booting** is encripted for each user, and it is dowmload from Handow Site. The authen-centor can deactivate it or communicate with SHandow set some flags if user expired ...

keep thinking.

### Story editor

+ web editor to write .feature story, more supporting and intracting than IDE?

Important and urgent now.

### Handow built-in server

+ Host Handow to server
+ Remote control
+ Socket for real time watching

### Super UI

+ Screenshots carousel, showing error on screenshot images
+ Instrument panel showing stories running in timeline, console showing stream info, choose story filter information, set alarm, break point,
+ History listing and rendering
+ History statistics
+ Play test movie

### Authentication flow