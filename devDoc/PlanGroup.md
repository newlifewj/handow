# Handow Runner, Plan and Group

After developers finished literal stories, he should get Steps code already, nevertheless, these Steps could be Dummy until filling with real code. Anyway, user can perform **Build** to generate all test Suites.

> A test Suite could contain some Dummy Steps, that doesn't block test running. Dummy steps will pass through successfully but will output warning and marked in reports.

We have test suites already, then how to run them? We shouldn't run a Suite directly, Handow need a Plan configuration to control Suites running. The plan will arrange Suites running cooperatively to resolve the dependence, avoid conflict, specify the coverage, and also settle the sequential/parallel issue.

## Stage and Group

Test is stateful operation because target application is driven by data, and data is changing along with test running. That's the root cause why we need arrange test with stage because it's not possible to run all test cases at the same moment, it has to be an ordered procedure.

> Maybe someone believe we can run test suites concurrently after presetting server to specific status, e.g. reset data and browser-env to correct status at the begining of each siute. That will not work because everything is shared, the same server, database and client (browser). The only possible way is running each test suite in an independent client enviroment and on an independent target instance, so that we get real parallel testing. - Yes, but that's crazy!

However, we really don't want run stories one after one in abstract sequential, because that spends to much on browser waiting. For example, most developers think 10 seconds waiting is normally to guarantee Ajax call,view refreshing ... Assumming we have a UAT cover 1000 actions - it's not big number for UAT coverage, then we need 160 minutes finishing all test cases. It is too long for waiting a UAT report, and totally not acceptable if developers want using UAT report verfiy their daily coding.

Fortunately, most suites can run in parallel by different browser tabs without conflict in specific situations, and the JavaScript non-blocking feature permit test suites runing in other test suites' waiting time. The result is **multiple test suites are evaluates in parallel with multiple browser windows** - if they are not conflict by data changing.

**Conclusion** Test is a stateful operation, but some suites could work in different browser instance without impact each other. So we can put these non-conflict suites in one **Parallel Group** but still run these groups sequentially. The running sequence of Groups are **Stages**.

> It is not necessary for all test cases running in parallel, we just hope some of them could be evaluated in different browser tab without conflict. In fact, most test case can run with some others in parallel and we can group them in one **Stage** to save a lot of time.

> As a matter of fact, running all test cases in parallel need to open as many browser windows as the test suites quantity. It doesn't make sense if there are a lot of suites.

### Plan - running config

Handow run suites according to a JSON config file, or Plan file.

```json
{
    "parameters": {
        "foo_parameter": "Foo_Value",
        "bar_parameter": "Bar_Value"
    },
    "description": {},
    "screenshots": "phase|act|failure|none",
    "labels": "withvalues|clean|verbose",
    "name": "",
    "stages": [
        {
            "name": "",
            "description": "",
            "break": true,
            "group": ["shuite1", "suite2", "suite3"]
        },
        {
            "name": "",
            "description": "",
            "break": false,
            "group": ["shuite4", "suite5", "suite6", "shuite7", "suite8", "suite9"]
        }
    ]
}
```

+ **paramters:** Plan can set global parameters for suites accessing in running time.
+ Some parameters are reused heavily across suites. We don't want modify them in each story when they changed (e.g. hostname and path ...). We can use global parameters for this requirement.
+ The global parameters are available for all test cases (Steps), e.g. they are defined as env variables in running time.
+ Condition Expressions **CAN NOT** refer Plan Parameter because Handow compiler will not refer any Plan in building process.
+ **name** and **descriptions** is a help to make report or monitoring easier. E.g. the **name** could be more readable the suite name and **description** can help user understand extra info of the Plan, Stage and Stories in current Stage Group.
+ **stages** is the main part of the Plan configuration. The stages will be executed sequentially according to their index of array. In each stage, suites in **group** array will run in parallel by opening a new browser tab or windows. A stage is finished when all suites in its group was finished.
+ **break** is a control flag indicate if test stop running in case of any error (in both Act and Fact steps) happened in current stage. When break flag is true, runner will not start running all following stages if any failure happened. Mostly we just want test continue to complete all suites. However, some stages are important, e.g. Login or reset test data in database, the following test just meaningless if this stage failed. **Dummy Step** result in an exception, this flag can control test break or continue when Dummy Step is evaluated.
+ **screenshots** Handow can take a scrrenshot for each **Phase** (take a screenshot after all acts finished), this is the default behavior. Plan can also specific take screenshot after each Act step, or take screenshot only for failed phase, or even no screenshot at all.
+ Handow reports list every step by label. The label format could clean but show current passed values. e.g *When I click \<submit_button=='#login-submit-btn'\>*, or clean type with values, e.g. *When I click \<submit_button\>*. Or even more verbose format with more info.

> Act steps don't verify any test criteria, they are operations navigate browser to the test point. But Handow do know **Act-Failed** by running exception (e.g. timeout exception, ...). When we test failure, actually means Act exceptions, Fact exceptions and Fact false result.

+ Act Excaption
+ Fact Exception
+ Fact False Result

> Suites access global parameters by node.js **process.env.handow.plan**, the Runner will set the global paramaters to this global object.

### How to run a plan

Actually Handow doesn't provide Plan Runner, it works depending on **Jest CLI**.

+ Handow use plan create a bash script run **Jest CLI Commands**, normally with pipeline.
+ Each **Jest Run** will finish a group of suites, in another word, each **Jest Run** finish a stage.
+ Handow create a bash pipe to call **Jest CLI** run the plan stage by stage
+ Before Handow run the bash script, suites are copied to correct directory already.
+ In the **group** array of a stage, just the suite file names - same as story file names.
+ Suite is generated by Handow, developers needn't maintain suite files manually. So we can put them into a flat folder - suites soup.

A bash script pipe example, *foo_plan.sh*:

```bash
#! /bin/bash
##########################################################################################
# Example shell script to run Jest CLI
##########################################################################################

echo "Start plan ---"
```

> Using bash script or create JS to process files and then call shell API? I think using JS may be flexible for flow control. If we choose a JS script run the plan, it is the Runner.

## How to group suites

When stories running in a group, we don't worry about the view conflict because they use different browser instances. However, they could impact each other by data.

+ Server state (e.g. session).
+ Database (except we use UI mock data. But UAT doesn't work with mock data).
+ env of test machine (e.g. cookies, localstorage and even local filesystem ...).

So we know all the **Read-Only suites** could be in one group. And even they change data but the changing data not impack each others, they can also in one group.

> For example, form submit will change the data, but it is still possible to submit multiple forms concurrently by different browser instances. Multi-User accessing is the nature of most web application. We just worry about the data conflict will inpact the following Facts verification. Anyway, it is business related issue when we think about which test suites could be grouped into one stage. 

### Split group even they can run in parallel

Sometimes there are too many suites in one group (could be evaluated in one stage), but we don't want open too many browser instances. So we also need use more groups run them in different stages.

### Stage depending

Actually we can design Stages not depending on each other. But that's only available when we can preset state. For example, we have API can reset database, reset server and test machine env ...

However, sometimes we have to execute test basing on the state of other stage's result. In this case we need arrange the stages sequential carefully. For example, there is not API to set server session, so we have to perform test basing one a stage tesing Login.

## Result integration

The last step of running test is create a report file. Handow will parse the result of all stages and compose a file easy for presenting.

### Preset starting state

In practice, we can design a stage to reset test env, and I guess there maybe only one Suite is evaluated in this stage. A Plan could include multiple starting stages to preset env and other stages following these starting stages.

