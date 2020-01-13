# How to use Puppeteer creating test

Using Puppeteer create test code is quite straightly, just **access page elements and verify the result page elements**. Sometimes we need make call to access remote server, e.g. reset server status and data. Maybe we need access local machine to set browser running env. Anyway, Puppeteer provide a lot of APIs for most test operations. In some special test case, we need import 3-party libraries, e.f. axios ...

However, Using Puppeteer doesn't mean you can create correct and robust test project. We still need some skills when we write code. The most important thing is **How to work arround asynchronou presenting**.

## Work arround asynchronous presenting

Broser render page in achronous way. That means the result is not presented synchronously with the operations. For example, the expected page is not showing immediately after you click a page link in current view, the data in a list is not updated immediately after you click the **Refresh** button. It is often failed when we test the expected result view after interact with the page due to browser's asynchronous nature. We can add extra code to fix this issue - **Synchronize Verify And Operating By Wait**.

### Wait a while

The easiest way is add a static waiting time after an operation,

```js
await page.$eval('#profile-submit', elelent => element.click());    // Click button to submit a form
await page.waitFor(3000);   // Wait 3 seconds
const message = await page.$eval( '#form-message-bar', element => element.innerHTML );  // Message should be presented
expect(message).toBe(`Profile updated sucessfully!`);
```

Easy, right? But we can not guarantee the message is always showing after 3 seconds.

> Static time waiting is only used for short asynchronous interval when we are quite sure about the latency.

### Wait for an element appear/disappear

Usually there is a sinificant element existing in the coming view. We can synchronize the test flow by watching its appearance. For example, we have known an element id unique in the result view after navigating to new page or refresh a partial view. So we can suspend current executing until that element appear. And we need set a timeout for the appear-watching-waiting to avoid watching an element forever. It is an exception if the appear-watching timeout. Something was wrong when the expected element didn't appear in a time window.

```js
await page.$eval('#profile-submit', elelent => element.click());    // Click button to submit a form
// Wait the element appear (existed in DOM without "display==none | visibility==hidden") with 20s timeout.
await page.waitForSelector('#form-message-bar', { visible: true, timeout: 20000 });
const message = await page.$eval( '#form-message-bar', element => element.innerHTML );  // Message should be presented
expect(message).toBe(`Profile updated sucessfully!`);
```

> On the contray we can also element not-display by _page.waitForSelector(selector, { hidden: true, timeout: ? });_. The waiting return immediately if element not existing or not displaying currently, so it is used to wait the element appearing now.

### Wait for some events, e.g. a Http reponse arrrived

Sometimes there is no representative element appearing to synchronize the operating and result, e.g. click an update button to change candiates of a dropdown component deiven by dynamic data. Fortunately, Poppeteer provide some event-waiting APIs for those scenarios.

```js
await page.$eval('#update-select-items', elelent => element.click());    // Click button for data updating
// Wait the Ajax call return 200OK with 20s timeout.
await page.waitForResponse( ( response ) => {
    return response.url().includes('https://api.example.net/candidates') && response.status() === 200;
}, { timeout: 20000 });
await page.awaitFor(300);   // Wait a moment for grogram process arriving data
// ToDo: We can continute test flow, the dynamic
```

### Special mark element appear

Basing on the UI design, sometimes there is a special elements existing for view and data dynamic refreshing, e.g. the Spin component. We can also synchronoize test steps by watching that mark element.

```js
await page.$eval('#profile-submit', elelent => element.click());    // Click button to submit a form
await page.waitFor(300);    // Wait for Spin to start spinning
// Wait the Spin element finished, suppose data and view were updated already
await page.waitForSelector('#form-message-bar', { hidden: true, timeout: 20000 });
const message = await page.$eval( '#form-message-bar', element => element.innerHTML );  // Message should be presented
expect(message).toBe(`Profile updated sucessfully!`);
```

> Synchronize actions are important, but Handow framework can not resolve this in system level because it is business related things. Developers need add special Acts to handle it. Handow provide built-in Act steps, e.g. _**When I wait it {selector} is displayed**,_ or _**When I wait it {url} is responsed 200**_, ...

## What is the difference between Given and When phase

+ The steps of **Given** and **When** phases are exactly same things.
+ All **Act** and **Fact** steps can be used in both.
+ No special **Given Acts** or **When Acts** (**Fact** steps are always labeld by **Then** in both phase)
+ As a matter of fact, there is no step labeld by **Given** in **Handow** step library (all Act steps are labeled with **When**).

### Examples

#### Given|When promptation

A developer is writing a story. IDE will prompt steps when he enter _'When I click'_:

```text
---------------------------------
| I click it (selector)         |
| I click the hyperlink (link)  |
| ...                           |
---------------------------------
```

> All the candidates come from **Act** library because the developer started the statement by **When**, and exactly same with starting by **Given** (And **And** keywaord follwing When|Given). Once after developers choose a step, he can edit the parameters (only the parameter names)

#### Then promptation

A developer is writing a story. IDE will prompt steps when he enter _'Then I can'_:

```text
-----------------------------------------------
| I can see it (selector) is displayed        |
| I can see it (selector) showing html (html) |
| ...                                         |
-----------------------------------------------
```

> All candidates steps come from **Fact** library because the developer started the statement by **Then**...

### Differences beteen Given and When

But there are some differences between **Given** and **When**.

+ In running time, any **Given Act** failure will end current suite immediately, because we can not continue tesing basing on wrong status. But **When Act** error only break current phase, maybe test could be continued after one phase failed.
+ However, mostly we should quit current suite after any **Act** failed. When an **Act** is failed, maybe a lot of failures will happen in following test. The failures will spend a lot of waiting time.
+ There are some differentials in report when process **Given** or **When**
+ Anyway, **Given or When** is not Step attributes, it is how to place them in a story.

> Actually, Handow doesn't break current suite testing. It always break a loop. (For stories without story looping, breaking a loop means end whole story)


