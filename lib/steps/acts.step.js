"use strict";

// /* eslint-disable no-undef */

/*
const Given = null;
const When = null;
const page = null;
const config = null;
*/

let window, document, browser, page, config, Given, When;

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
    
    await page.type(selector, value, { delay: 50 });
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

When("I reload page", async () => {
    await page.reload();
});

When("I navigate browser to move forward", async () => {
    await page.goForward();
});

When("I navigate browser to move backward", async () => {
    await page.goBack();
});

Given("I do nothing", async () => {
    await page.waitFor( 100 );
});

When("I do nothing", async () => {
    await page.waitFor( 100 );
});

/**
 * Compound step to handle upload a file or multiple file
 * selector: the clicker which will open file picker
 * path: the path of the uploading file in local file system (multiple files separated by comma)
 * Althought "elementHandle.uploadFile(...filePaths)" is easier, but it not the real UI interaction
 */
When("I click it {selector} and choose the file paths {paths}", async (selector, paths) => {
    
    const filePaths = paths.split(",");

    await page.waitForSelector(selector, { visible: true, timeout: 1000 });
    const uploadClicker = await page.$$(selector);

    const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.evaluate( el => el.click(), uploadClicker[0] )

        // page.click('#upload-file-button'), // some button that triggers file selection
    ]);

    await fileChooser.accept(filePaths);

    config.reactTime && await page.waitFor(config.reactTime);  
});


/**
 * Strike a keyboard key
 */
When("I press keyboard key {key}", async (key) => {
    await page.keyboard.press(key);
});

/**
 * https://github.com/puppeteer/puppeteer/blob/main/src/common/USKeyboardLayout.ts
 * The shotcuts parameters is an array with 2 or 3 keys, e.g. ["ControlLet", "V"], ["ControlLeft", "ShiftLeft", "N"] ...
 * For 2 keys array, the 1st 1 is held as mmodifier and hit the 2nd key.
 * For 3 keys array, The 1st and 2nd are held as modifiers and hit the 3rd key. 
 */
When("I press keyboard shotcuts keys {keys}", async (keys) => {
    const combinedKeys = keys.split(" ")
    if ( Array.isArray(combinedKeys) && combinedKeys.length > 1 && combinedKeys.length < 4 ) {
        await page.keyboard.down(combinedKeys[0]);
        if ( combinedKeys.length > 2 ) {
            await page.keyboard.down(combinedKeys[1]);
            await page.keyboard.press(combinedKeys[2]);
            await page.keyboard.up(combinedKeys[1]);
        } else {
            await page.keyboard.press(combinedKeys[1]);
        }
        await page.keyboard.up(combinedKeys[0]);

    } else {
        throw TypeError(`Invalid shotcut  - ${keys}`);
    }
});

When("I continue", async () => {
    await page.waitFor(300);
});
