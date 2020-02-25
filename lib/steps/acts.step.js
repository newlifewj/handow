"use strict";

// /* eslint-disable no-undef */
const Given = null;
const When = null;
const page = null;
const config = null;

// 'page' and 'config' will be injected in run time

When("I go to url {url}", async (url) => {
    await page.goto(url);
});

When("I click it {selector}", async (selector) => {
    /* Doesn't work */
    // await page.$eval( selector, (element) => element.click() );
    await page.waitForSelector(selector, { visible: true, timeout: 1000 });
    const elements = await page.$$(selector);
    // pptr tricky, re-evalated element and click will work well. Click element immediately is not stable.
    page.evaluate( el => el.click(), elements[0] );
    // elements[0].click();     // Not stable when use real Chrome.
    config.reactTime && await page.waitFor(config.reactTime);
});

When("I click it {xpath}", async (xpath) => {
    await page.waitForXPath(xpath, { visible: true, timeout: 1000 });
    const elements = await page.$x(xpath);
    page.evaluate( el => el.click(), elements[0] );
    // elements[0].click();
    config.reactTime && await page.waitFor(config.reactTime);
});

When("I wait it {selector} is displayed", async (selector) => {
    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
});

When("I wait it {xpath} is displayed", async (xpath) => {
    await page.waitForXPath(xpath, { visible: true, timeout: config.elementAppearTimeout });
});

When("I wait it {selector} is disappeared", async (selector) => {
    await page.waitForSelector(selector, { hidden: true, timeout: config.elementAppearTimeout });
});

When("I wait it {url} is responsed with status {status}", async (url, status) => {
    await page.waitForResponse( ( response ) => {
        return response.url().includes(url) && response.status() == status;
    });
});

When("I wait it {url} is sent with {httpMethod}", async (url, httpMethod) => {
    await page.waitForRequest( ( request ) => {
        return request.url().includes(url) && request.method() === httpMethod;
    });
});

When("I wait time {seconds} seconds", async (seconds) => {
    await page.waitFor( seconds * 800 );
});

When("I continue testing", () => {
    return true;
});

When("I wait all pending requests resolved", async () => {
    await page.pendingXHR.waitForAllXhrFinished();
});

When("I wait all pending requests resolved in seconds {seconds}", async (seconds) => {

    // Wait 2 promise race, then continue flow when the first promise resolved
    await Promise.race( [
        page.pendingXHR.waitForAllXhrFinished(),
        new Promise( resolve => {
          setTimeout( resolve, seconds * 1000 );
        } )
      ] );
    
    const pendings = page.pendingXHR.pendingXhrCount();
    if ( pendings > 0 ) {
        throw new TypeError(`Timeout for ${pendings} requests pending`);
    }
});

// TODO: 

/**
 * Common step to handle all XHR request, including CRUD, PATCH and HEAD.
 */
When("I send request xhr {xhr}", async (xhr) => {
    if ( xhr && xhr.method && xhr.url ) {
        await page.axios.request(xhr)
        .then( (resp) => {
            page["xhr"] = resp;
            page["xhreq"] = xhr;    // attached original request properties
        } )
        .catch( (err) => {
            if ( err.response ) {
                page["xhr"] = err.response;
                page["xhreq"] = xhr;        // attached original request properties
            } else {
                return Promise.reject(err);
            }
           
        } ).finally( () => {
            // page["xhr"] = null;
        } );
    } else {
        throw new TypeError(`The XHR is not defined properly`);
    }
});

When("I enter value {value} to input {selector}", async (value, selector) => {
    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
    const elements = await page.$$(selector);
    await page.evaluate( el => el.focus(), elements[0] );
    await page.waitFor(100);    // Make sure not missing characters

    // Clear the input box
    await page.$eval( selector, el => (el.value = "") );
    
    await page.keyboard.type(value);
    await page.evaluate( el => el.blur(), elements[0] );

    // Doesn't work if input listen events, e.g. change, focus ...
    // await page.$eval( selector, el => el.value = value );
    config.reactTime && await page.waitFor(config.reactTime);
});

When("I focus on it {selector}", async (selector) => {
    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
    const elements = await page.$$(selector);
    page.evaluate( el => el.focus(), elements[0] );
    await page.waitFor(100);    // Make sure not missing characters, important
    config.reactTime && await page.waitFor(config.reactTime);
});

When("I hover on it {selector}", async (selector) => {
    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
    const elements = await page.$$(selector);
    page.evaluate( el => el.hover(), elements[0] );
    await page.waitFor(100);    // Make sure not missing characters
    config.reactTime && await page.waitFor(config.reactTime);
});

When("I select option {option} of it {selector}", async (option, selector) => {
    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
    await page.select(selector, option);
    config.reactTime && await page.waitFor(config.reactTime);
});

Given("I set cookies {cookies} to current browser instance", async (cookies) => {
    await page.setCookie(...cookies);
});

When("I set cookies {cookies} to current browser instance", async (cookies) => {
    await page.setCookie(...cookies);
});

// It is just an alias of "I wait it (selector) is displayed"
Given("I have seen it {selector} is displayed", async (selector) => {
    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
});

Given("I have seen it {xpath} is displayed", async (xpath) => {
    await page.waitForXPath(xpath, { visible: true, timeout: config.elementAppearTimeout });
});

Given("I have opened url {url}", async (url) => {
    await page.goto(url);
});

When("I move mouse hover on it {selector}", async (selector) => {
    // await page.hover(selector);
    // hover the element first matched
    const element = await page.$(selector);
    await element.hover();
    config.reactTime && await page.waitFor(config.reactTime);
});

When("I move mouse hover on it {xpath}", async (xpath) => {
    const elements = await page.$x(xpath);
    await elements[0].hover();
    config.reactTime && await page.waitFor(config.reactTime);
});

Given("I do nothing", async () => {
    await page.waitFor( 100 );
});

When("I do nothing", async () => {
    await page.waitFor( 100 );
});

