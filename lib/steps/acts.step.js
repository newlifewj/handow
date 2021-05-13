"use strict";

/* eslint-disable no-undef */

// References will inject to step contex in running time
const browser = null;
const page = null;
const config = null;
const Given = null;
const When = null;
const fs = require('fs');
const path = require('path');

// The response listener for catch xhr together with an action
const _watchResp = async (resp, page, xhr) => {
    const methods = ["get", "post", "put", "delete", "head"];
    const req = resp.request();
    let _data;

    if ( `${ resp.url() }`.includes(`${ xhr.url }`)
        && methods.includes(`${req.method().toLowerCase()}`)
        && `${req.method().toLowerCase()}` === xhr.method.toLowerCase()) {
        let respRaw;
        let reqBody = '';
        try {
            respRaw = await resp.text();
            const respJson = JSON.parse(respRaw);
           _data = respJson;
            
        } catch (e) {
            // If the response is not JSON data, mostly it is html. Encode the "<,>"s to prevent rendering it 
            _data = respRaw.toString().replace(/>/g, '&gt;').replace(/</g, '&lt;');
        }

        // Only take caer the POST and PUT request body
        if (`${req.method().toLowerCase()}` === 'post'
            || `${req.method().toLowerCase()}` === 'put') {
            try {
                reqBody = JSON.parse(req.postData());
            } catch (e) {
                reqBody = req.postData();
            }
        }
        
        // record the xhr to current page, and it will presented in report
        page['xhr'] = {
            request: {
                path: `${ resp.url() }`
            },
            data: _data,
            status: resp.status(),
            headers: resp.headers()
        };
        page['xhreq'] =  {
            url: `${req.url()}`,
            method: `${req.method()}`,
            headers: req.headers(),
            data: reqBody
        };
    }
};
// -----------------------

/**
 * Address browser to specified URL
 * @param {string} url - A valid full URL address
 * @throws - Throw timeout broken error if ducument is not loaded in 30 seconds
 */
When("I go to {url}", async (url) => {
    await page.goto(url);
});

/**
 * Address browser to specified URL and watch a XHR along with nivagation
 * @param {string} url - A valid full URL address
 * @param {object} xhr - { method: ["GET", "POST", "PUT", "DEKETE", "HEAD"], url: [String]}. (The url coud be URL partial)
 * @throws - Throw timeout broken error if ducument is not loaded in 30 seconds
 */
When("I go to {url} and watch {xhr}", async (url, xhr) => {
    // Watch: Pass step env to the listener
    const watchResp = async (resp) => _watchResp(resp, page, xhr);

    // Watch: listen XHR responses before the action
    page.on('response', watchResp);

    await page.goto(url);

    // Watch: Remove the event listener after XHRs resolved
    await page.pendingXHR.waitForAllXhrFinished();
    page.off('response', watchResp);
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
When("I click {selector}", async (selector) => {
    /* Doesn't work */
    // await page.$eval( selector, (element) => element.click() );
    await page.waitForSelector(selector, { visible: true, timeout: 1000 });
    const elements = await page.$$(selector);
    // pptr tricky, re-evalated element and click will work well. Click element immediately is not stable.
    await page.evaluate( el => el.click(), elements[0] );

    // elements[0].click();     // Not stable when use real Chrome.
    // config.reactTime && await page.waitForTimeout(config.reactTime);
});

/**
 * Mouse click an element specified by selector and watch a XHR along with the action
 * @param {string} selector - A valid css-selector or Handow-probe
 * @param {object} xhr - { method: ["GET", "POST", "PUT", "DEKETE", "HEAD"], url: [String]}. (The url coud be URL partial)
 * @throws - Throw timeout broken error if element not found in 1 second
 */

When("I click {selector} and watch {xhr}",  async (selector, xhr) => {
    // Watch: Pass step env to the listener
    const watchResp = async (resp) => _watchResp(resp, page, xhr);

    await page.waitForSelector(selector, { visible: true, timeout: 1000 });
    const elements = await page.$$(selector);
    // pptr tricky, re-evalated element and click will work well. Click element immediately is not stable.

    // Watch: listen XHR responses before the action, no matter SUCCESS or FAILED
    page.on('response', watchResp);

    await page.evaluate( el => el.click(), elements[0] );
    
    // elements[0].click();     // Not stable when use real Chrome.
    // config.reactTime && await page.waitForTimeout(config.reactTime);

    // Watch: Remove the event listener after XHRs resolved
    await page.pendingXHR.waitForAllXhrFinished();
    page.off('response', watchResp);
});

/**
 * Mouse click an element specified by xpath
 * @param {string} xpath - A valid xpath or Handow-probe
 * @throws - Throw timeout broken error if element not found in 1 second
 */
When("I click {xpath}", async (xpath) => {
    await page.waitForXPath(xpath, { visible: true, timeout: 1000 });
    const elements = await page.$x(xpath);
    await page.evaluate( el => el.click(), elements[0] );
    // elements[0].click();
    // config.reactTime && await page.waitForTimeout(config.reactTime);
});

/**
 * Mouse click an element specified by xpath
 * @param {string} xpath - A valid xpath or Handow-probe
 * @param {object} xhr - { method: ["GET", "POST", "PUT", "DEKETE", "HEAD"], url: [String]}. (The url coud be URL partial)
 * @throws - Throw timeout broken error if element not found in 1 second
 */
 When("I click {xpath} and watch {xhr}", async (xpath) => {
    
    // Watch: Pass step env to the listener
    const watchResp = async (resp) => _watchResp(resp, page, xhr);

    await page.waitForXPath(xpath, { visible: true, timeout: 1000 });
    const elements = await page.$x(xpath);

    // Watch: listen XHR responses before the action
    page.on('response', watchResp);

    await page.evaluate( el => el.click(), elements[0] );
    // config.reactTime && await page.waitForTimeout(config.reactTime);

    // Watch: Remove the event listener after XHRs resolved
    await page.pendingXHR.waitForAllXhrFinished();
    page.off('response', watchResp);
});

/**
 * Focus on a focus-able element specified by selector
 * @param {string} selector - A valid css-selector or Handow-probe
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I focus on {selector}", async (selector) => {
    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
    const elements = await page.$$(selector);
    await page.evaluate( el => el.focus(), elements[0] );
    // config.reactTime && await page.waitForTimeout(config.reactTime);
});

/**
 * Focus on a focus-able element specified by xpath
 * @param {string} xpath - A valid xpath or Handow-probe
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I focus on {xpath}", async (xpath) => {
    await page.waitForXPath(xpath, { visible: true, timeout: config.elementAppearTimeout });
    const elements = await page.$x(xpath);
    await page.evaluate( el => el.focus(), elements[0] );
    // config.reactTime && await page.waitForTimeout(config.reactTime);
});

/**
 * Mouse hover on the element sepcified by selector
 * @param {string} selector - A valid css-selector or Handow-probe
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I move mouse hover on {selector}", async (selector) => {
    const element = await page.$(selector, { visible: true, timeout: config.elementAppearTimeout });
    await element.hover();
    // config.reactTime && await page.waitForTimeout(config.reactTime);
});

/**
 * Mouse hover on the element sepcified by xpath
 * @param {string} xpath - A valid xpath or Handow-probe
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I move mouse hover on {xpath}", async (xpath) => {
    const elements = await page.$x(xpath, { visible: true, timeout: config.elementAppearTimeout });
    await elements[0].hover();
    // config.reactTime && await page.waitForTimeout(config.reactTime);
});

/**
 * Enter to input element (elements could be typed in) specified by selector
 * @param {string} value - The typed value
 * @param {string} selector - A valid selector or Handow probe
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I enter {value} to {selector}", async (value, selector) => {
    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
    const elements = await page.$$(selector);
    await page.evaluate( el => el.focus(), elements[0] );
    await page.waitForTimeout(100);    // Make sure not missing characters

    // Clear the input box
    await page.$eval( selector, el => (el.value = "") );
    
    await page.type(selector, value, { delay: 50 });
    await page.evaluate( el => el.blur(), elements[0] );

    // Doesn't work if input listen events, e.g. change, focus ...
    // await page.$eval( selector, el => el.value = value );
    // config.reactTime && await page.waitForTimeout(config.reactTime);
});

/**
 * Enter to input element (elements could be typed in) specified by xpath
 * @param {string} value - The typed value
 * @param {string} xpath - A valid xpath or Handow probe
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I enter {value} to {xpath}", async (value, xpath) => {
    await page.waitForXPath(xpath, { visible: true, timeout: config.elementAppearTimeout });
    const elements = await page.$x(xpath);
    await page.evaluate( el => el.focus(), elements[0] );
    await page.waitForTimeout(100);    // Make sure not missing characters

    // Clear the input box
    // element[0].evaluate( (el) => { el.value = ""; } );
    await page.evaluate( el => { el.value = ""; }, elements[0] );
    
    await elements[0].type(value, { delay: 50 });
    await page.evaluate( el => el.blur(), elements[0] );

    // config.reactTime && await page.waitForTimeout(config.reactTime);
});

// Will remove, because the multi-select step can cover this
When("I select {option} of {selector}", async (option, selector) => {
    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
    await page.select(selector, option);
    // config.reactTime && await page.waitForTimeout(config.reactTime);
});

/**
 * Select one or multiple option to handle the Select or Multi-Select element (Not for dropdowns not using <selec> tag)
 * @param {string} selector - A valid css-selector or Handow-probe to specify the select element
 * @param {string} options - The option value or multiple option valuse separated by ","
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I select {options} of {selector}", async (options, selector) => {
    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });

    const _options = options.split(",").map((item) => item.trim());
    await page.select(selector, ..._options);
    // config.reactTime && await page.waitForTimeout(config.reactTime);
});

/**
 * Select one or multiple option to handle the Select or Multi-Select element (Not for dropdowns not using <selec> tag)
 * @param {string} xpath - A valid xpath or Handow-probe to specify the select element
 * @param {string} options - The option value or multiple option valuse separated by ","
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I select {options} of {xpath}", async (options, xpath) => {
    await page.waitForXPath(xpath, { visible: true, timeout: config.elementAppearTimeout });

    const _options = options.split(",").map((item) => item.trim());
    const elements = await page.$X(xpath);
    await elements[0].select(..._options);
    // config.reactTime && await page.waitForTimeout(config.reactTime);
});

/**
 * Compound step to handle upload a file or multiple files. Althought "elementHandle.uploadFile(...filePaths)" is easier, but it not the real UI interaction.
 * @param {string} selector: A valid selector or Handow-probe to specify the "Choose File" clicker (which will open files-picker)
 * @param {string} paths: The valid absulute path or relative path (relative with project root) of local file system, multiple files are separated by comma.
 * @throws - Throw timeout error if the elements not available in configured time, and throws uploading failed error too
 */
When("I click {selector} and choose the files {paths}", async (selector, paths) => {
    
    const filePaths = paths.split(",");

    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
    const uploadClicker = await page.$$(selector);

    const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.evaluate( el => el.click(), uploadClicker[0] )
    ]);

    await fileChooser.accept(filePaths);

    // config.reactTime && await page.waitForTimeout(config.reactTime); 
});

/**
 * Compound step to handle upload a file or multiple files. Althought "elementHandle.uploadFile(...filePaths)" is easier, but it not the real UI interaction.
 * @param {string} xpath: A valid xpath or Handow-probe to specify the "Choose File" clicker (which will open files-picker)
 * @param {string} paths: The valid absulute path or relative path (relative with project root) of local file system, multiple files are separated by comma.
 * @throws - Throw timeout error if the elements not available in configured time, and throws uploading failed error too
 */
When("I click {xpath} and choose the files {paths}", async (xpath, paths) => {
    
    const filePaths = paths.split(",");

    await page.waitForXPath(xpath, { visible: true, timeout: config.elementAppearTimeout });

    const elements = await page.$x(xpath);
    const uploadClicker = elements;

    const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.evaluate( el => el.click(), uploadClicker[0] )
    ]);

    await fileChooser.accept(filePaths);

    // config.reactTime && await page.waitForTimeout(config.reactTime);  
});

/**
 * Strike a keyboard key
 * @param {string} key - The valid key code https://github.com/puppeteer/puppeteer/blob/main/src/common/USKeyboardLayout.ts
 * @throw - Throw timeout error if error happened
 */
When("I press keyboard {key}", async (key) => {
    await page.keyboard.press(key);
});


/**
 * The shotcuts parameters is an array with 2 or 3 keys, e.g. "ControlLet V", "ControlLeft ShiftLeft N"] ...
 * For 2 keys array, the 1st 1 is held as mmodifier and hit the 2nd key.
 * For 3 keys array, The 1st and 2nd are held as modifiers and hit the 3rd key.
 * @param {string} keys - Valid key codes separated with space. https://github.com/puppeteer/puppeteer/blob/main/src/common/USKeyboardLayout.ts
 * @throws - Custom error, "Invalid shotcut ..." 
 */
When("I press keyboard shotcuts {keys}", async (keys) => {
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
When("I set {cookies} to current page", async (cookies) => {
    await page.setCookie(...cookies);
});

/**
 * Send XHR request from test context (NOT BY CURRENT PAGE)
 * @param {object | array} xhr - The object could serialized to JSON as request with fields: ["method", "url", "baseURL", "headers", "data"]
 * Note: The xhr parameter should be defined in parameter files, DO NOT define them in @parameter: [{}] block in the story
 *       The ["baseURL", "headers", "data"] fields are optional according to other fieds and requirements
 */
When("I send request {xhr}", async (xhr) => {
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
When("I wait {selector} is displayed", async (selector) => {
    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
});

/**
 * Wait elements are available, the elements are specidied by xpath
 * @param {string} xpath - A valid xpath or Handow-probe
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I wait {xpath} is displayed", async (xpath) => {
    await page.waitForXPath(xpath, { visible: true, timeout: config.elementAppearTimeout });
});

/**
 * Wait elements are disappeared, either hidden or removed from DOM (the element is NOT disappeared even if its content is empty or not visible)
 * @param {string} selector - A valid css-selector or Handow-probe
 * @throws - Throw timeout error if the elements are still displayed in configured time
 */
When("I wait {selector} is disappeared", async (selector) => {
    await page.waitForSelector(selector, { hidden: true, timeout: config.elementAppearTimeout });
});

/**
 * Wait elements are disappeared, either hidden or removed from DOM (the element is NOT disappeared even if its content is empty or not visible)
 * @param {string} xpath - A valid xpath or Handow-probe
 * @throws - Throw timeout error if the elements are still displayed in configured time
 */
When("I wait {xpath} is disappeared", async (xpath) => {
    await page.waitForXPath(xpath, { hidden: true, timeout: config.elementAppearTimeout });
});

/**
 * Wait a request is resolved with given http status. The request is specified by URL
 * @param {string} url - A valid URL to specify a request sending from current page
 * @param {string} status - Valid HTTP status, e.g. "200", "301", "403" ...
 * @throws - Timeout error if request is not resolved in 30 seconds, or custom error if the HTTP status is not expected
 */
When("I wait {url} is responsed with {status}", async (url, status) => {
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
When("I wait all pending requests resolved in {seconds}", async (seconds) => {

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
When("I wait {url} is sent with {httpMethod}", async (url, httpMethod) => {
    await page.waitForRequest( ( request ) => {
        if ( request.url().includes(url) && `${request.method()}` === `${httpMethod}` ) {
            return true;
        } else {
            throw new TypeError(`The sent request (${request.url()}+${request.method()}) is not as expected - (${url}+${httpMethod})`);
        }
    });
});

/**
 * Remove files from local machine for clean the test filesystem env
 * @param {string} files - The file name partials (beginsWith) for matching the target files
 * @param {string} folder - The directory of the removing files
 * @throws - delete file exceptions
 * 
 */
Given("I have removed {files} in {folder} from filesystem", (files, folder) => {
    // Create regexp basing on file name partial, e.g. "app.credential" for "app.credential.json, app.credential(1).json, ..."
    const regex = new RegExp(files);
    
    const fileList = fs.readdirSync(folder).filter( f => regex.test(f) );
    if (fileList.length > 0) {
        try {
            fileList.map( file => fs.unlinkSync( `${path.join(folder, file)}` ) );
        } catch (err) {
            throw new TypeError(`${err.message}`);
        }
        
    }
});

/**
 * Download current page as .html file and add timestamp to file name
 * @param {string} file - The file name and path relative with project root, e.g. "temp/about.html" (it should be .html file)
 * @throws - write file or create dir exceptions
 */
 When("I download the content of current page as {file}", async (file) => {

    const html = await page.content();

    if (html) {
        let _filename = path.basename(`${file}`);
        let _dirname = path.dirname(`${file}`);

        if (_filename.endsWith(".html")) {
            // If the filename is .html, insert timestamp into it// If the filename is .html, insert timestamp into it
            _filename = `${_filename.slice(0, -5)}-${Date.now()}.html`;
        } else {
            // Force the file to be .html
            _filename = `${_filename}-${Date.now()}.html`;
        }

        // Force the file path relative with current project root
        if (_dirname.startsWith("/")) {
            _dirname = `${_dirname}`.slice(1);
        }

        if (!fs.existsSync(_dirname)) {
            fs.mkdirSync(_dirname);
        }

        fs.writeFileSync(`${_dirname}/${_filename}`, `${html}`);
    }
    
});

/**
 * Wait specified seconds
 * @param {number} seconds - time in seconds
 */
When("I wait {seconds}", async (seconds) => {
    await page.waitForTimeout( seconds * 1000 );
});


// ------------------------------------------------------------------------------
/**
 * Grammatical step
 */
When("I continue", async () => {
    await page.waitForTimeout(300);
});

/**
 * Fake step
 */
When("I do nothing", async () => {
    await page.waitForTimeout( 100 );
});

