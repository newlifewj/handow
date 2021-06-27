"use strict";

/* eslint-disable no-undef */

// References will inject to step contex in running time
// const browser = null;   // browser here means browser context
const page = null;
const config = null;
const Given = null;
const When = null;
const fs = require('fs');
const path = require('path');
// eslint-disable-next-line node/no-missing-require
const handow = require('handow');   // The handow module is improted in run time, not current path


/**
 * Response listener to record XHR along which an action, e.g. record the ajax transaction when click the Submit button
 * @param {object} resp Response
 * @param {object} page Current page
 * @param {object} xhr The XHR pattern object: { method: ["GET", "POST", "PUT", "DEKETE", "HEAD"], url: [String] } - the url coud be URL partial
 */
const _watchResp = async (resp, page, xhr) => {
    const methods = ["get", "post", "put", "delete", "head"];   // XHR record only handle these REST methods
    const req = resp.request();
    let _data;

    if ( `${ resp.url() }`.includes(`${ xhr.url }`)
        /*
            If the response matches the 'xhr' pattern, add the XHR record to current page
        */
        && methods.includes(`${req.method().toLowerCase()}`)
        && `${req.method().toLowerCase()}` === xhr.method.toLowerCase()) {
 
        let reqBody = '';
        try {
            _data = await resp.json();      // Parse response with JSON, throw exception if it is not JSON data
            
        } catch (e) {
            // If the response is not JSON data, mostly it is html. Encode the "<,>"s to prevent rendering it
            const respRaw = await resp.text();
            if (respRaw) {
                _data = respRaw.toString().replace(/>/g, '&gt;').replace(/</g, '&lt;');
            } else {
                _data = "Unrecognized Response";
            }
            
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
            data: reqBody ? reqBody : null
        };
    }
    
};

const _uploadFiles = async (fileChooser, files) => {
    await fileChooser.setFiles(files);
};


/**
 * Address browser to specified URL and wait network idle (no trafic, no pending, ...)
 * @param {string} url - A valid full URL address
 * @throws - Throw timeout broken error if ducument is not loaded in defaultTimeout
 */
When("I go to {url}", async (url) => {
    await page.goto(url);   // { waitUntil: "networkidle" } is not stable!
    // await page.goto(url, { waitUntil: "networkidle" });
});
Given("I have opened {url}", async (url) => {
    await page.goto(url);
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
 * Relaod page
 * @throws - Throw timeout error if document is nor loaded in defaultTimeout
 */
 When("I reload page", async () => {
    await page.reload();

    if (config.handlePendingXHR) {
        await page.waitPendingXHR();
    }
});

/**
 * Address browser to specified URL and watch a specific XHR during nivagating
 * @param {string} url - A valid full URL address
 * @param {object} xhr - { method: ["GET", "POST", "PUT", "DEKETE", "HEAD"], url: [String]}. (The url coud be URL partial)
 * @throws - Throw timeout error if ducument is not loaded in defaultTimeout, or other exceptions of page operations
 * @note The xhr parameter MUST be defined in parameter files instead of in @parameter: [{}] block in the story
 */
When("I go to {url} and watch {xhr}", async (url, xhr) => {
    /*
        Refer the 'I click {selector} and watch {xhr}' step
    */
    const watchResp = (resp) => _watchResp(resp, page, xhr);

    /*
        Bind listener to an event, the listener should be removed later.
        "page.waitForEvent('response', watchResp)" is NOT the equivalent statement, which is used to synchronize with event instead of bind listener
    */
    page.on('response', watchResp);
    // page.waitForEvent('response', watchResp);

    await Promise.all([
        page.waitForEvent( 'request' ),     // Will use the defaultTimeout
        page.goto(url)
    ]);

    /* page.waitPendingXHR() is an optional middleware */
    if (config.handlePendingXHR) {
        await page.waitPendingXHR();
    }
    
    page.removeListener('response', watchResp);    // remove the listener
});

/**
 * Click an element specified by selector
 * @param {string} selector - A valid css-selector, xpath or handow-probe
 * @throws - Throw timeout error if element not found in 1 second, throw other errors for further operation on the elements
 */
When("I click {selector}", async (selector) => {
    /*
        The reliable selector locating way:
        1, Wait selector visible
        2, Get the reference of the slector array
        3, Then choose the array, the 1st element or any one by index
        Actually the following 2 statements are equal to 'const elements = await page.$$(selector, { state: "visible" });'
    */
    await page.waitForSelector(selector, { state: "visible", timeout: config.elementAppearTimeout });
    const elements = await page.$$(selector);

    await page.evaluate( el => el.click(), elements[0] );
});

/**
 * Click an element specified by selector and watch a XHR along with the action
 * @param {string} selector - A valid css-selector or Handow-probe
 * @param {object} xhr - { method: ["GET", "POST", "PUT", "DEKETE", "HEAD"], url: [String]}. (The url coud be URL partial)
 * @throws - Throw timeout broken error if element not found in 1 second
 * @note The xhr parameter MUST be defined in parameter files instead of in @parameter: [{}] block in the story
 */

When("I click {selector} and watch {xhr}",  async (selector, xhr) => {
    /* Define a named listener function by wrapping the XHR-Watcher - for 'removeListener' */
    const watchResp = (resp) => _watchResp(resp, page, xhr);

    await page.waitForSelector(selector, { visible: true });
    const elements = await page.$$(selector);

    /* Bind the watcher funtion to 'response', it will add the expected XHR to current page */
    page.on('response', watchResp);
   
    /*
        Click the button, and trigger the request.
        Make sure the request happened, otherwise the 'await page.waitPendingXHR()' maybe miss the XHR pending (firefox has this issue ...)
    */
    await Promise.all([
        page.waitForEvent( 'request' ),
        page.evaluate( el => el.click(), elements[0] )
    ]);

    /* page.waitPendingXHR() is an optional middleware */
    if (config.handlePendingXHR) {
        await page.waitPendingXHR();        // Wait for all XHR are resolved
    }

    /* Remove the watcher listener */
    await page.removeListener('response', watchResp);
});

/**
 * Click an element specified by selector if it is visible now, so this action always pass
 * @param {string} selector - A valid css-selector or Handow-probe
 * @throws - Throw timeout broken error if element not found in 1 second
 */
 When("I click {selector} if it is visible", async (selector) => {
    const _sel =  await page.waitForSelector(selector, { state: "visible", timeout: config.elementAppearTimeout });
    if ( _sel ) {
        const elements = await page.$$(selector);
        // pptr tricky, re-evalated element and click will work well. Click element immediately is not stable.
        await page.evaluate( el => el.click(), elements[0] );
    }
});

/**
 * Focus on a focus-able element specified by selector
 * @param {string} selector - A valid css-selector or Handow-probe
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I focus on {selector}", async (selector) => {
    await page.waitForSelector(selector, { state: "visible", timeout: config.elementAppearTimeout });
    const elements = await page.$$(selector);
    await page.evaluate( el => el.focus(), elements[0] );
});

/**
 * Mouse hover on the element sepcified by selector
 * @param {string} selector - A valid css-selector or Handow-probe
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I move mouse hover on {selector}", async (selector) => {
    await page.waitForSelector(selector, { state: "visible", timeout: config.elementAppearTimeout });
    const elements = await page.$$(selector);

    await elements[0].hover();
});

/**
 * Enter to input element specified by selector
 * @param {string} value - The typed value
 * @param {string} selector - A valid selector or Handow probe
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I enter {value} to {selector}", async (value, selector) => {
    await page.waitForSelector(selector, { state: "visible", timeout: config.elementAppearTimeout });
    const elements = await page.$$(selector);
    
    /* Must focus on the input because 'focus' is the actual operation  */
    await elements[0].evaluate( el => el.focus() );
    // await page.evaluate( el => el.focus(), elements[0] );    // equivalent statement

    await elements[0].evaluate( el => (el.value = "") );    // clear the input
    
    await elements[0].type(value, { delay: 50 });       // type in

    await elements[0].evaluate( el => el.blur() );      // blur off the input

});

/**
 * Select one or multiple option to handle the Select or Multi-Select element (Not for dropdowns not using <selec> tag)
 * @param {string} selector - A valid css-selector or Handow-probe to specify the select element
 * @param {string} options - The option value or multiple option valuse separated by ","
 * @throws - Throw timeout error if the elements not available in configured time
 */
When("I select {options} of {selector}", async (options, selector) => {
    const _options = options.split(",").map((item) => item.trim());
    
    await page.waitForSelector(selector, { state: "visible", timeout: config.elementAppearTimeout });
    const elements = await page.$$(selector);

    await elements[0].selectOption(..._options);    // equal to "await page.selectOption(selector, ..._options)""

});

/**
 * Compound step to handle upload a file or multiple files. Althought "elementHandle.uploadFile(...filePaths)" is easier, but it not the real UI interaction.
 * @param {string} selector: A valid selector or Handow-probe to specify the "Choose File" clicker (which will open files chooser)
 * @param {string} paths: The valid absulute path or relative path (relative with working root, e.g. the SHM server root) of local file system, multiple files are separated by comma.
 * @throws - Throw timeout error if the elements not available in configured time, and throws uploading failed error too
 */
When("I click {selector} and choose the files {paths}", async (selector, paths) => {
    
    const filePaths = paths.split(",");     // file array

    /* Set the files chooser handler and add it as "filechooser" event listener, so that the handler is fired when the filechooser windonw popup */
    const uploadFiles = (chooser) => _uploadFiles(chooser, filePaths);
    page.on("filechooser", uploadFiles);

    /* click the Choose File button or files input element, then the file choosing popover is opened */
    await page.waitForSelector(selector, { state: "visible", timeout: config.elementAppearTimeout });
    const uploadClicker = await page.$$(selector);
    await page.evaluate( el => el.click(), uploadClicker[0] );      // Trigger the files chooser window, the 'filechooser' handler will work

    /* After a while, remove the listener */
    await page.waitForTimeout(500);
    page.removeListener("filechooser", uploadFiles);    // Remove the 'filechooser' handler after 2 seconds
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
 * The shotcuts parameters is an array with 2 or 3 keys, e.g. "ControlLeft V", "ControlLeft ShiftLeft N"] ...
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
 * @param {[object] | object} cookies - Multi cookies in an array, e.g. [{name: "NAME1", value: "VALUE1"}, {name: "NAME1", value: "VALUE2"}, ...], or single cookie object
 * Note: The cookies paramter should be defined in parameter files, DO NOT define them in @parameter: [{}] block in the story
 * The cookies shoud include url or domain/path attributes, otherwiser the default url is current page url
 */
When("I set {cookies} to browser context", async (cookies) => {
    const context = page.context();
    if (Array.isArray(cookies)) {
        for (const cookie of cookies) {
            /* If no valid path or url in the cookie, use current page url */
            if (!cookie.url && (!cookie.dimain || !cookie.path)) {
                cookie.url = page.url();
            }
        }
        await context.addCookies(cookies);
    } else {
        if (!cookie.url && (!cookie.dimain || !cookie.path)) {
            cookie.url = page.url();
        }
        await context.addCookies([cookies]);
    }
    
});

/**
 * Send XHR request from test context (NOT BY CURRENT PAGE)
 * @param {object | array} xhr - The XHR request with fields: ["method", "url", "baseURL", "headers", "data"] ("baseURL", "headers", "data" fields are optional according to requirements)
 * @note The xhr parameter MUST be defined in parameter files instead of in @parameter: [{}] block in the story
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
 * Setup test client application by XHR and stop test running if the response status is not expected.
 * @param {object | array} xhr - The object could serialized to JSON as request with fields: ["method", "url", "baseURL", "headers", "data"]
 * @param {string} httpStatus - The expected http status to continue running, 'undefined' will ignore the response status and keep running 
 * @note The xhr parameter MUST be defined in parameter files instead of in @parameter: [{}] block in the story
 */
 When("I setup client application with request {xhr} and continue on {httpStatus}", async (xhr, httpStatus) => {
    if ( xhr && xhr.method && xhr.url ) {
        await page.axios.request(xhr)
        .then( (resp) => {
            if (`${resp.status}` !== `${httpStatus}` && `${httpStatus}` !== "undefined") {
                handow.stop();
            } else {
                page["xhr"] = resp;     // attach response to page
                page["xhreq"] = xhr;    // attached original request properties
            }
        } )
        .catch( (err) => {
            if ( err.response ) {
                if (`${err.response.status}` !== `${httpStatus}` && `${httpStatus}` !== "undefined") {
                    handow.stop();
                } else {
                    page["xhr"] = err.response;
                    page["xhreq"] = xhr;        // attached original request properties
                }
            } else if (`${httpStatus}` === "undefined") {
                page["xhr"] = null;
                return Promise.reject(err);
            } else {
                handow.stop();
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
 When("I wait {selector} is presenting", async (selector) => {
    /*
        Use additional try-catch to provide custom error message. The original timeout exception is too long
    */
    try {
        await page.waitForSelector(selector, { state: "visible", timeout: config.elementAppearTimeout });
    } catch (e) {
        throw new TypeError(`Timeout (${config.elementAppearTimeout}ms) to wait element presenting`);
    }
});

/**
 * Wait elements are disappeared, either hidden or removed from DOM (the element is NOT disappeared even if its content is empty or not visible)
 * @param {string} selector - A valid css-selector or Handow-probe
 * @throws - Throw timeout error if the elements are still displayed in configured time
 */
 When("I wait {selector} disappeared", async (selector) => {
    await page.waitForSelector(selector, { state: 'hidden', timeout: config.elementDisappearTimeout });
});

/**
 * Wait a request is resolved with given http status. The request is specified by URL
 * @param {string} url - A valid URL to specify a request sending from current page
 * @param {string} status - Valid HTTP status, e.g. "200", "301", "403" ...
 * @throws - Timeout error if request is not resolved in 30 seconds, or custom error if the HTTP status is not expected
 */
When("I wait {url} is responsed with {status}", async (url, status) => {
    const response = await page.waitForResponse(url);
    if (response && `${response.status()}` === `${status}`) {
        return true;
    } else {
        throw new TypeError(`The received response (${response.url()}+${response.status()}) is not as expected - (${url}+${status})`);
    }
});

/**
 * Wait pending XHR requests resolved on current page in specified time
 * @param {number} seconds - The waiting time to resolve all pending requests
 * @throws - Custom error for requests are still pending on timeout 
 */
When("I wait all pending requests resolved in {seconds}", async (seconds) => {
    /* page.waitPendingXHR() is an optional middleware */
    if (config.handlePendingXHR) {
        // Wait 2 promise race, then continue flow when the first promise resolved
        await Promise.race( [
            page.waitPendingXHR(),
            new Promise( resolve => {
                setTimeout( resolve, seconds * 1000 );
            } )
        ] );
        
        await page.waitForTimeout(300);     // More time to wait page stable after XHRs resolved
    }
});

/**
 * Wait all XHR request resolved
 * @throws - Timeout error for 30 seconds
 */
When("I wait all pending requests resolved", async () => {
    /* page.waitPendingXHR() is an optional middleware */
    if (config.handlePendingXHR) {
        await page.waitPendingXHR();

        await page.waitForTimeout(300);     // More time to wait page stable after XHRs resolved
    }
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
 * @param {string} selector Element selector, e.g. CSS Selector, xpath or Handow-Probe ...
 * @description When the UI application call window.open() to open a new window, the new popup window appears immediately (not like open new tab: <a href="..." _tagrget="blank"></a>).
 * We can use 2 steps for new tab, e.g. When I click {selector}; I can see the new tab {url} is opened, because the new tab is opened after Http loading.
 * But for "window.open()", we have to preset the listener to catch the window appear event immediately with the click ...
 */
 When("I click {selector} to open a popup window", async (selector) => {
    
    await page.waitForSelector(selector, { state: "visible" });
    const elements = await page.$$(selector);

    /*
        popup will be null on waitEvent('popup') timeout 
    */
    const [popup] = await Promise.all([
        /*
            Setup the listener before trigger the new window opening because the new popup appear immediately after 'click'
        */
        page.waitForEvent('popup'),
        /*
            trigger the popup
        */
        page.evaluate( el => el.click(), elements[0] )      // Same as 'elements[0].evaluate( el => el.click() )'
    ]);

    if (popup) {
        /*
            The new popup need sometime to be stable, actutally we need to add "When I wait {seconds}" step to fix this issue.
        */
        await page.waitForTimeout(1000);
        page.popup = popup;
    }
});

/**
 * Download current page as .html file, and timestamp is added to file name, e.g. "ggSearch-1624743139637.html"
 * @param {string} file - The file name and path relative with project root, e.g. "temp/about.html" (it should be .html file)
 * @throws - write file or create dir exceptions
 * @note - Maybe it is not a normal test step, but it is a help to know the targe page without source code.
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

