# Handow Outline

**E2E** test is not equivalent to **UAT** (User Acceptance Test) technically, but they are the same thing for web application. We do need a test tool running on browser directly to verify if the accessing behavior appearances and data presenting meet the requirement, and we only need one mostly - whatever it's called **E2E** or **UAT**. After a good cover UAT deployed, the **Unit Test** and **Integrated Test** could be omitted because most features are covered already by the **duck test**.

> The **UAT** project is always required, but **Unit Test** and **Integrated Test** could be optional when we have a good covered **UAT**. At least we just need a little bit of them for some critical logic and behavior.

**Handow** is a framework to make **E2E** test or **UAT** easier, It stands on **Puppeteer** and **Jest**, just looks like other **BDD** test tools, e.g. **Cucumber**, **Serenity** ...

> Why called **Handow**? **Puppeteer** is a greate help for writing test on Chrome. But the test writers maybe boring with repeating the boilerplate of test suites. Just like the Puppeteer is a little weary of using those puppets, preparing the theatre. So he will think why don't just play hand shadow? **Handow** is the short of **Hand Shadow**.

## Parallel and Sequential

One significant feature of **Handow** is parallel testing, this will resuce a lot of time. There are some essential points of Hnadow framework.

### Jest run multiple suites (.js test files) in paralle with multiple workers

When Jest use **Worker Pool**, multiple workers can run test in different processes. The workers number could be specified by Jest CLI or config. The issue is different workers can not communicate with each other. So the parallel running test suites can not share anything, e.g. they can not share the same browser instance. In another word, each test suite always use a new browser instance.

#### How many workers should be defined for Jest

Running test suites in parallel can save a lot of time. But that doesn't mean the more workers the faster test running.

+ The more cpu cores existing in the test maching, the more workers could be defined.
+ The realtionship between cpus and workes is not One-Core-One-Worker. Multi workers (actually multiple processes) are still available in single core computer. But the performance will not be as good as multi-core machine.
+ Spawn worker process also need some time and consume system resource. The time saving effect will be not as expected if we deploy too many workers.
+ Normally, 4 or 5 workers will be good for most test project. (Or even 3 if the test run in a single core machine).
+ If each test suite will last a long time and there are a lot waiting in testing, then multi-workers can same a lot of time. On the contrary, the multi-workers can not save much when each test suite are short and running rapidly.
+ In practice, using 4 workers could be almost 3 times faster than complete serial running. That's a big progress already.
+ Don't use many short test suites in one stage group, multiple workers can not help this scenario too much.

### Browser cookies, chache, Incognito browsers

Browsers have memory, they cache some data in local machine, e.g. cookies, htmls ... For a mordern web applicaiton, we always build the UI into versioned bundle files. In this case, the web-resource caching is not a problem for **UAT** any more. The only thing is the cookies which will impact the test design and running. Actually they are important function features need to be verified.

#### Regular browser instances, Incognito instances vs cookies

+ The regular browser instance can persisit/refer permanent cookies to/from local machine.
+ All the regular browser instances share the same permanent cookies set. E.g. any new regular browser instances are login after user login with one browser instance.
+ Even all regular browser instances are closed, then the new opened regular browser instances are still login because the cookie is not expired.
+ The Incognigto browser can not access permanent cookies persisted by regular browser.
+ The Incognigto browser also maintain cookies, but not by perment way.
+ All Incognito browser instances share same cookies in Incognito browser context. After **all Incognito browser instances** are cloased, the cookies for them will be vanished immediately.

### When should open Incognito instnace

Normally, we just open Regular browser instances, cookies are available for **all test suites runing in all stages**. That's good for cookies share, e.g. all test cases are basing on one user login.

However, we do need test scenarios basing on different cookies, e.g. different user roles login.

In Handow, we don't use browser instance **directly**. Instead we use **Browser Context** object.

```js
    browser = await puppeteer.launch({ /* config object */ });

    const context = await browser.defaultBrowserContext();      // This is the browser regular context
    const context = await browser.createIncognitoBrowserContext();  // Create an incognito context
```

Unlike Chrome behavior in your laptop

+ Browser instances don't share cookies and chache.
+ Browser instances don't persist any thing to file system. Cookies and chache are vanished after browser instance closed.
+ Any browser instance has a default context, you can not close it.
+ You can create additonal contexts to a browser instance, these additonal contexts are incognito context.
+ The contexts of a browser instance don't share cookies and cache.
+ The pages of a context can share cookies and cache.
+ When you open a new page with _browser.newPage()_, the page is opened in default context.
+ Is it possible to persist cookies and cache by specify local path ...?

Can we use a cookie file and maintain them by code? So that Handow can provide steps to persist cookies and restore cookies from/to browser instances? Interesting thinking.

```text
# Store cookies after admin login success
When I persist cookies {name: admin_cookies}

# Restore cookies to a browser context
When I restore cookies {name: admin_cookies}
```
### New page open inside a suite testing

## Concept and Vocabulary

Plan
Group
Stage
Sequential
Parallel

Story
Phase
Literal (step)
Suite
Step
Dummy Step
Real Step
Zombie Step


## How Handow help

+ User write BDD stories with Given-When-Then syntax (Create Literal-Suites)
+ Handow generate Step Catalog by parsing stories.
+ If user refer the Stardard Step Library in a Literal Step, Handow can generate Real Step in Step Catalog. Otherwise Dummy Steps are generated in Step Catalog.
+ User can edit the Dummy Steps by filling with real code.
+ Same Literal StepS will share same steps in Step Catalog.
+ Basing on the Step Catalog, Hnadow can compile stories to suites.
+ User can create Plans to run the test suites with different way, e.g. run full, subset, reuse ...

**Suites could be reused in a plan, e.g. appear in different stage ...*

## Browser new instance, reuse instance, open new Page (Tab)

In order to improve performance, we can use _puppeteer.connect/disconnect()_ instead of _puppeteer.launch/close()_ to reuse existed browser instances. Of course, we need add more logic to know there is an anailable instance or not. A new browser instance is always created when there is no idle browser instance available. But the browser instance will be disconnected after current suite finished and the endpoint will added to the **Idle Browser Instances List**. So that they can be reused by following suites. **Note: a looping suite always use one browser instance (don't lanuch new for each looping)**. And all browser instances will be closed when Plan finshed.

Puppeteer also support creating **Incognito Browser Instance**, so that will not worry about the cookies and bowser cache brought by previous test.

Except open or reuse browser instance, we can also open a new tab to improve performance. For example, mostly we can use different tabs to flat run a **When Loop**. So that all the looping **When Phase** are starting at different tabs with same view. And the pages will be closed after **When Phase Loop** fnished.

## Not using Jest

Jest is just a runner for the **describe**, **test** template code. I found it is hard to borrow Jest in Handow runner.

+ The code structure is terrible, we have to translate suite stories into nest **describe/test** code, seems not necessary at all.
+ We can only control the test flow basing Jest API. That is not accepted for some good Handow feaures.
+ Jest will generate its report file, maybe Handow need new format reports easier for presenting.
+ Handow need **Dynamic Reporting** for the future remote monitoring. Jest can not provide this feature. (Maybe we can do this by deep invesgating Jest, don't want do this).
+ Actually, I just use the **expect** library of Jest in Handow.
