"use strict";

/* eslint-disable no-undef */

// References will inject to step contex in running time
const browser = null;
const page = null;
const config = null;
const Given = null;
const When = null;

/**
 * Address browser to specified URL
 * @param {string} url - A valid full URL address
 * @throws - Throw timeout broken error if ducument is not loaded in 30 seconds
 */
When("I go to url {url}", async (url) => {
    await page.goto(url);
});

/**
 * Refresh browser
 * @throws - Throw timeout broken error if document is nor loaded in 30 seconds
 */
When("I reload page", async () => {
    await page.reload();
});

/**
 * Go forward
 * @throws - Throw timeout broken error if ducument is not loaded in 30 seconds
 */
When("I navigate browser to move forward", async () => {
    await page.goForward();
});

/**
 * Go backward
 * @throws - Throw timeout broken error if ducument is not loaded in 30 seconds
 */
When("I navigate browser to move backward", async () => {
    await page.goBack();
});

/**
 * Mouse click an element specified by selector
 * @param {string} selector - A valid css-selector or Handow-probe
 * @throws - Throw timeout broken error if element not found in 1 second
 */
When("I click it {selector}", async (selector) => {
    /* Doesn't work */
    // await page.$eval( selector, (element) => element.click() );
    await page.waitForSelector(selector, { visible: true, timeout: 1000 });
    const elements = await page.$$(selector);
    // pptr tricky, re-evalated element and click will work well. Click element immediately is not stable.
    await page.evaluate( el => el.click(), elements[0] );
    // elements[0].click();     // Not stable when use real Chrome.
    config.reactTime && await page.waitFor(config.reactTime);
});

/**
 * Mouse click an element specified by xpath
 * @param {string} xpath - A valid xpath or Handow-probe
 * @throws - Throw timeout broken error if element not found in 1 second
 */
When("I click it {xpath}", async (xpath) => {
    await page.waitForXPath(xpath, { visible: true, timeout: 1000 });
    const elements = await page.$x(xpath);
    await page.evaluate( el => el.click(), elements[0] );
    // elements[0].click();
    config.reactTime && await page.waitFor(config.reactTime);
});

/**
 * Focus on a focus-able element specified by selector
 * @param {string} selector - A valid css-selector or Handow-probe
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I focus on it {selector}", async (selector) => {
    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
    const elements = await page.$$(selector);
    await page.evaluate( el => el.focus(), elements[0] );
    config.reactTime && await page.waitFor(config.reactTime);
});

/**
 * Focus on a focus-able element specified by xpath
 * @param {string} xpath - A valid xpath or Handow-probe
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I focus on it {xpath}", async (xpath) => {
    await page.waitForXPath(xpath, { visible: true, timeout: config.elementAppearTimeout });
    const elements = await page.$x(xpath);
    await page.evaluate( el => el.focus(), elements[0] );
    config.reactTime && await page.waitFor(config.reactTime);
});

/**
 * Mouse hover on the element sepcified by selector
 * @param {string} selector - A valid css-selector or Handow-probe
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I move mouse hover on it {selector}", async (selector) => {
    const element = await page.$(selector, { visible: true, timeout: config.elementAppearTimeout });
    await element.hover();
    config.reactTime && await page.waitFor(config.reactTime);
});

/**
 * Mouse hover on the element sepcified by xpath
 * @param {string} xpath - A valid xpath or Handow-probe
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I move mouse hover on it {xpath}", async (xpath) => {
    const elements = await page.$x(xpath, { visible: true, timeout: config.elementAppearTimeout });
    await elements[0].hover();
    config.reactTime && await page.waitFor(config.reactTime);
});

/**
 * Enter to input element (elements could be typed in) specified by selector
 * @param {string} value - The typed value
 * @param {string} selector - A valid selector or Handow probe
 * @throws - Throw timeout error if the elements not available in configured time
 */
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

/**
 * Enter to input element (elements could be typed in) specified by xpath
 * @param {string} value - The typed value
 * @param {string} xpath - A valid xpath or Handow probe
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I enter value {value} to input {xpath}", async (value, xpath) => {
    await page.waitForXPath(xpath, { visible: true, timeout: config.elementAppearTimeout });
    const elements = await page.$x(xpath);
    await page.evaluate( el => el.focus(), elements[0] );
    await page.waitFor(100);    // Make sure not missing characters

    // Clear the input box
    // element[0].evaluate( (el) => { el.value = ""; } );
    await page.evaluate( el => { el.value = ""; }, elements[0] );
    
    await elements[0].type(value, { delay: 50 });
    await page.evaluate( el => el.blur(), elements[0] );

    config.reactTime && await page.waitFor(config.reactTime);
});

// Will remove, because the multi-select step can cover this
When("I select option {option} of it {selector}", async (option, selector) => {
    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
    await page.select(selector, option);
    config.reactTime && await page.waitFor(config.reactTime);
});

/**
 * Select one or multiple option to handle the Select or Multi-Select element (Not for dropdowns not using <selec> tag)
 * @param {string} selector - A valid css-selector or Handow-probe to specify the select element
 * @param {string} options - The option value or multiple option valuse separated by ","
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I select options {options} of it {selector}", async (options, selector) => {
    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });

    const _options = options.split(",").map((item) => item.trim());
    await page.select(selector, ..._options);
    config.reactTime && await page.waitFor(config.reactTime);
});

/**
 * Select one or multiple option to handle the Select or Multi-Select element (Not for dropdowns not using <selec> tag)
 * @param {string} xpath - A valid xpath or Handow-probe to specify the select element
 * @param {string} options - The option value or multiple option valuse separated by ","
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I select options {options} of it {xpath}", async (options, xpath) => {
    await page.waitForXPath(xpath, { visible: true, timeout: config.elementAppearTimeout });

    const _options = options.split(",").map((item) => item.trim());
    const elements = await page.$X(xpath);
    await elements[0].select(..._options);
    config.reactTime && await page.waitFor(config.reactTime);
});

/**
 * Compound step to handle upload a file or multiple files. Althought "elementHandle.uploadFile(...filePaths)" is easier, but it not the real UI interaction.
 * @param {string} selector: A valid selector or Handow-probe to specify the "Choose File" clicker (which will open files-picker)
 * @param {string} paths: The valid absulute path or relative path (relative with project root) of local file system, multiple files are separated by comma.
 * @throws - Throw timeout error if the elements not available in configured time, and throws uploading failed error too
 */
When("I click it {selector} and choose the files paths {paths}", async (selector, paths) => {
    
    const filePaths = paths.split(",");

    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
    const uploadClicker = await page.$$(selector);

    const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.evaluate( el => el.click(), uploadClicker[0] )
    ]);

    await fileChooser.accept(filePaths);

    config.reactTime && await page.waitFor(config.reactTime); 
});

/**
 * Compound step to handle upload a file or multiple files. Althought "elementHandle.uploadFile(...filePaths)" is easier, but it not the real UI interaction.
 * @param {string} xpath: A valid xpath or Handow-probe to specify the "Choose File" clicker (which will open files-picker)
 * @param {string} paths: The valid absulute path or relative path (relative with project root) of local file system, multiple files are separated by comma.
 * @throws - Throw timeout error if the elements not available in configured time, and throws uploading failed error too
 */
When("I click it {xpath} and choose the files paths {paths}", async (xpath, paths) => {
    
    const filePaths = paths.split(",");

    await page.waitForXPath(xpath, { visible: true, timeout: config.elementAppearTimeout });

    const elements = await page.$x(xpath);
    const uploadClicker = elements;

    const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.evaluate( el => el.click(), uploadClicker[0] )
    ]);

    await fileChooser.accept(filePaths);

    config.reactTime && await page.waitFor(config.reactTime);  
});

/**
 * Strike a keyboard key
 * @param {string} key - The valid key code https://github.com/puppeteer/puppeteer/blob/main/src/common/USKeyboardLayout.ts
 * @throw - Throw timeout error if error happened
 */
When("I press keyboard key {key}", async (key) => {
    await page.keyboard.press(key);
});


/**
 * The shotcuts parameters is an array with 2 or 3 keys, e.g. "ControlLet V", "ControlLeft ShiftLeft N"] ...
 * For 2 keys array, the 1st 1 is held as mmodifier and hit the 2nd key.
 * For 3 keys array, The 1st and 2nd are held as modifiers and hit the 3rd key.
 * @param {string} keys - Valid key codes separated with space. https://github.com/puppeteer/puppeteer/blob/main/src/common/USKeyboardLayout.ts
 * @throws - Custom error, "Invalid shotcut ..." 
 */
When("I press keyboard shotcuts keys {keys}", async (keys) => {
    const combinedKeys = keys.split(" ");
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

/**
 * Set cookies to current page context
 * @param {[object]} cookies - Multi cookies in an array, e.g. [{name: "NAME1", value: "VALUE1"}, {name: "NAME1", value: "VALUE2"}, ...]
 * Note: The cookies paramter should be defined in parameter files, DO NOT define them in @parameter: [{}] block in the story
 */
When("I set cookies {cookies} to current page", async (cookies) => {
    await page.setCookie(...cookies);
});

/**
 * Send XHR request from test context (NOT BY CURRENT PAGE)
 * @param {object | array} xhr - The object could serialized to JSON as request 
 * Note: The xhr parameter should be defined in parameter files, DO NOT define them in @parameter: [{}] block in the story
 */
When("I send request xhr {xhr}", async (xhr) => {
    if ( xhr && xhr.method && xhr.url ) {
        await page.axios.request(xhr)
        .then( (resp) => {
            page["xhr"] = resp;     // attach response to page
            page["xhreq"] = xhr;    // attached original request properties
        } )
        .catch( (err) => {
            if ( err.response ) {
                page["xhr"] = err.response;
                page["xhreq"] = xhr;        // attached original request properties
            } else {
                page["xhr"] = null;
                return Promise.reject(err);
            }
           
        } ).finally( () => {
            // page["xhr"] = null;
        } );
    } else {
        throw new TypeError(`The XHR is not defined properly`);
    }
});

/**
 * Wait elements are available, the elements are specidied by selector
 * @param {string} selector - A valid css-selector or Handow-probe
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I wait it {selector} is displayed", async (selector) => {
    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
});

/**
 * Wait elements are available, the elements are specidied by xpath
 * @param {string} xpath - A valid xpath or Handow-probe
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I wait it {xpath} is displayed", async (xpath) => {
    await page.waitForXPath(xpath, { visible: true, timeout: config.elementAppearTimeout });
});

/**
 * Wait elements are disappeared, either hidden or removed from DOM (the element is NOT disappeared even if its content is empty or not visible)
 * @param {string} selector - A valid css-selector or Handow-probe
 * @throws - Throw timeout error if the elements are still displayed in configured time
 */
When("I wait it {selector} is disappeared", async (selector) => {
    await page.waitForSelector(selector, { hidden: true, timeout: config.elementAppearTimeout });
});

/**
 * Wait elements are disappeared, either hidden or removed from DOM (the element is NOT disappeared even if its content is empty or not visible)
 * @param {string} xpath - A valid xpath or Handow-probe
 * @throws - Throw timeout error if the elements are still displayed in configured time
 */
When("I wait it {xpath} is disappeared", async (xpath) => {
    await page.waitForXPath(xpath, { hidden: true, timeout: config.elementAppearTimeout });
});

/**
 * Wait a request is resolved with given http status. The request is specified by URL
 * @param {string} url - A valid URL to specify a request sending from current page
 * @param {string} status - Valid HTTP status, e.g. "200", "301", "403" ...
 * @throws - Timeout error if request is not resolved in 30 seconds, or custom error if the HTTP status is not expected
 */
When("I wait it {url} is responsed with status {status}", async (url, status) => {
    await page.waitForResponse( ( response ) => {
        if ( response.url().includes(url) && `${response.status()}` === `${status}` ) {
            return true;
        } else {
            throw new TypeError(`The received response (${response.url()}+${response.status()}) is not as expected - (${url}+${status})`);
        }
    });
});

/**
 * Wait pending XHR requests resolved on current page in specified time
 * @param {number} seconds - The waiting time to resolve all pending requests
 * @throws - Custom error for requests are still pending on timeout 
 */
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
 * Wait all XHR request resolved
 * @throws - Timeout error for 30 seconds
 */
When("I wait all pending requests resolved", async () => {
    await page.pendingXHR.waitForAllXhrFinished();
});

/**
 * Wait given XHR request is sent from current page
 * @param {string} url - The url of expected XHR
 * @param {string} httpMethod - The method of expected XHR, e.g. "GET", "POST", ...
 * @throws - Timeout error, or custom error if the request was not as expected.
 */
When("I wait it {url} is sent with {httpMethod}", async (url, httpMethod) => {
    await page.waitForRequest( ( request ) => {
        if ( request.url().includes(url) && `${request.method()}` === `${httpMethod}` ) {
            return true;
        } else {
            throw new TypeError(`The sent request (${request.url()}+${request.method()}) is not as expected - (${url}+${httpMethod})`);
        }
    });
});

/**
 * Wait specified seconds
 * @param {number} seconds - time in seconds
 */
When("I wait seconds {seconds}", async (seconds) => {
    await page.waitFor( seconds * 1000 );
});


// ------------------------------------------------------------------------------
/**
 * Grammatical step
 */
When("I continue", async () => {
    await page.waitFor(300);
});

/**
 * Fake step
 */
When("I do nothing", async () => {
    await page.waitFor( 100 );
});

