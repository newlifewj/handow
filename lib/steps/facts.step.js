'use strict';

/* eslint-disable no-undef */

// References will inject to step contex in running time
const browser = null;   // browser here means browser context
const page = null;
const config = null;
const Then = null;

const expect = require('expect');
const _ = require('lodash');
const deepExtend = require('deep-extend');
// eslint-disable-next-line node/no-missing-require
const handow = require('handow');   // The handow module is improted in run time, not current path


/**
 * @playwright Verify URL address of current page
 * @param {string} url - URL
 * @throws - Expectation
 */
Then("I see the address of current page is {url}", async (url) => {
    const addr = await page.url();
    expect(addr).toBe(url);
});

/**
 * Step to stop handow engine, only for local debug usage
 */
Then("I stop test running", () => {
    handow.stop();
});

/**
 * @playwright Verify the elements exist in current page, no matter of it is hadden or empty
 * @param {string} selector - Valid css-selector or Handow-probe to specify the elements
 * @throws - Expectation
 */
Then("I verify {selector} existed", async (selector) => {
    try {
        const html = await page.$$eval( selector, elements => elements[0].outerHTML );
        expect(html).toBeDefined();

    } catch (e) {
        throw new TypeError(`Element doesn't exist`);
    }
    
});

/**
 * Verify the specified elements existed and visible, wait the expected result in given time
 * @param {string} selector - Valid css-selector or Handow-probe
 * @throws - Expectation and custom timeout error if, finally, elements not displayed
 */
 Then("I can see {selector} presented", async (selector) => {
    try {
        await page.waitForSelector(selector, { state: "visible", timeout: config.elementAppearTimeout });
    } catch (e) {
        throw new TypeError(`Timeout (${config.elementAppearTimeout}ms) to wait element presenting`);
    }
});

/**
 * @playwright Verify the specified elements NOT exist or disappeared (hidden or none-display), wait the expected result in given time
 * @param {string} selector - Valid css-selector or Handow-probe
 * @throws - Expectation and custom timeout error if, finally, the elements exist and visible
 */
 Then("I cannot see {selector}", async (selector) => {
    try {
        await page.waitForSelector(selector, { state: 'hidden', timeout: config.elementDisappearTimeout });
    } catch (err) {
        throw new TypeError(`Element is not disappeared in (${config.elementDisappearTimeout}ms) watching period`);
    }
});

/**
 * @playwright Verify if the visible content (showing on screen) of specified element CONTAINS given text
 * @param {string} selector - Valid css-selector or Handow-probe
 * @param {string} text - text content
 * @throws - Custom errors
 */
Then("I can see {selector} showing {text}", async (selector, text) => {
        // Wait element appear and visible
        await page.waitForSelector(selector, { state: "visible", timeout: config.elementAppearTimeout });

        const _text = await page.$eval(selector, (el) => el.innerText);

        if ( !( _text.includes(text) ) ) {
            throw new TypeError(`The given text is not showing in element inner content`);
        }
});

/**
 * @playuwright Verify element contains given HTML block, no matter the HTML block is visible or not
 * @param {string} selector - Valid css-selector or Handow-probe
 * @param {string} html - HTML snippet
 * @throws - Expeaction
 */
Then("I verify {selector} contains {html}", async (selector, html) => {
    const _html = await page.$eval(selector, (el) => el.innerHTML);
    expect(_html).toBe(html);
    /*
    const elements = await page.$x( xpath );
    
    const _innerHTML = await (await elements[0].getProperty('innerHTML')).jsonValue();
    expect(_innerHTML).toEqual(html);
    */
});


/**
 * @playwright Verify given number elments exist in current page
 * @param {number} number - The given number for expected elements
 * @param {string} selector - Valid selector or Handow-probe
 * @throws - Expectation and timeout error
 */
Then("I can see {number} items of {selector} exist", async (number, selector) => {
    await page.waitForSelector(selector, { timeout: config.elementAppearTimeout });
    const elements = await page.$$( selector );

    expect(elements.length).toEqual(number);
});

/**
 * @playwright Verify the visible text content of specified elements are sorted by given alphabet order
 * @param {string} selector - Valid selector or Handow-probe
 * @param {string} order - Sorting code, lower/upper cases of "asc, desc, ascending, descending"
 * @throws - Expectation and timeout error in configured time
 */
Then("I can see {selector} sorted by {order}", async (selector, order) => {
    await page.waitForSelector(selector, { state: "visible", timeout: config.elementAppearTimeout });

    // Here elements are JSHandle object array (ElementHandle array?)
    const elements = await page.$$( selector );

    const textArray = [];
    for (const element of elements ) {
        textArray.push( await page.evaluate( el => el['innerText'], element ) );
    }

    const _order = order.toLowerCase();

    const _ta = [...textArray];

    if (_order === "asc" || _order === "ascending") {
        // Don't want output mass message
        if ( _ta.join("").length < 101 ) {
            expect(textArray).toEqual(_ta.sort());
        } else if ( `${_ta.join("")}` !== `${_ta.sort().join("")}` ) {
            throw new TypeError(`The elements are not sorted by Ascending order`); 
        }

    } else if (_order === "desc" || _order === "descending") {
        // Don't want output mass message
        if ( _ta.join("").length < 101 ) {
            expect(textArray).toEqual(_ta.sort());
        } else if ( `${_ta.join("")}` !== `${_ta.sort().reverse().join("")}` ) {
            throw new TypeError(`The elements are not sorted by Descending order`); 
        }

    } else {
        expect(order).toEqual("'valid ascending or descending keyword'");
    }
});

/**
 * @playwright Verify the specified input element with given value
 * @param {string} selector - Valid selecor or Handow-probe
 * @param {string} text - Given value
 * @throws - Expectation and timeout error
 * @Note - Input value and expected value are trim() before compared
 */
Then("I can see the input {selector} value equals {text}", async (selector, text) => {
    await page.waitForSelector(selector, { state: "visible", timeout: config.elementAppearTimeout });
    const _value = await page.$eval(selector, (el) => el.value);
    expect(_value.trim()).toBe(text.trim());
});


/**
 * @playwright Verify the visible element is enabled (check the "disabled" attrubute actually)
 * @param {string} selector - Valid selector or Handow-probe
 * @throws - Expectation and timeout error
 */
Then("I can see {selector} is enabled", async (selector) => {
   await page.waitForSelector(`${selector}`, { state: "visible", timeout: config.elementAppearTimeout });
   const elements = await page.$$(selector);
   const attr = await page.evaluate( el => el['disabled'], elements[0] );
   expect(`${attr}`).toBe('false');
});


/**
 * @playwright Verify the visible element is disabled
 * @param {string} selector - Valid selector or Handow-probe
 * @throws - Expectation and timeout error
 */
Then("I can see {selector} is disabled", async (selector) => {
   await page.waitForSelector(`${selector}`, { state: "visible", timeout: config.elementAppearTimeout });
   const elements = await page.$$(`${selector}`);
   const attr = await page.evaluate( el => el['disabled'], elements[0] );
   expect(`${attr}`).toBe('true');
});

/**
 * @playwright Verify the given DOM property with given value exists in specified element (no matter it is visible or not)
 * @param {string} name - The property name
 * @param {string} value - The expected value of the given property
 * @param {string} selector - Valid css-selector or Handow-probe
 * @throws - Expectation
 */
Then("I verify the property {name} of {selector} equals {value}", async (name, selector, value) => {
    await page.waitForSelector(`${selector}`, { state: "visible", timeout: config.elementAppearTimeout });
    /* // --- Only works for form elements like input, button
    const _element = await page.$(selector);
    const _value = await _element.getProperty(name);
    expect(await _value.jsonValue()).toBe(value.trim());
    */
 
    /* // --- WORKS, but the DOM API is only for selector
    const attrValue = await page.evaluate( (sel, attr) => {
        const _element = document.querySelector(sel);
        return _element.getAttribute(`${attr}`)
    }, selector, name );
    expect(`${attrValue}`).toBe(`${value.trim()}`);
    */
    const elements = await page.$$(selector);
    const attrValue = await page.evaluate( ([el, attr]) => el.getAttribute(attr), [elements[0], name] );
    expect(`${attrValue}`).toBe(`${value.trim()}`);
});

/**
 * Verify the given computed style is active on specified elements.
 * @param {string} name - The given style property name, it is style key e.g. "color", "font-size", "margin-right" ...
 * @param {string} value - The given value of the style, e.g. "rgb(34, 139, 34)", "14px", "20%" ...
 * @param {string} selector - CSS Selector, xpath or Handow Probe
 * @throws - Expectation
 */
Then("I verify the active style {name} of {selector} is {value}", async (name, selector, value) => {

    await page.waitForSelector(selector, { state: "visible" });     // Wait element visible and stable

    /*
        'page.$(selector, ...)' and 'page.$$(selector, ...)' resolve the selector to playwright ElementHandle.
        'page.$eval(selector ...) and 'page.$$eval(selector ...) resolve the selector to normal serialized object, and the serialized object could be access in brower window APIs
    */
    const styleValue = await page.$eval( selector, (el, [name]) => {    // The 'el' is not ElementHandler
        return window.getComputedStyle(el).getPropertyValue(name);
    }, [name] );

    expect(styleValue).toBe(value.trim());
});

/**
 * @playwright Verify a new tab opened, e.g. href _target-blank (by searching new tabs/windows and check the URL is matching or not)
 * 1, Don't care about it is new tab or window, browsers cannot guarantee this
 * 2, The new tab or windows are closed after this step
 * 3, Will not move foucus on the new opened tab or window, so we don't test elements in the new tab or window.
 * 4, If you do need test new opened page, custom this step by removing the close code block and ...
 * @param {string} url - The expected URL of the new tab or window
 * @throws - Expectation, or timeout error if no new tab or window opened in 30s
 */
Then("I can see the new tab {url} is opened", async (url) => {
    const newTabPage = await browser.waitForEvent('page');
    let newTabUrl = "Not Open";
    if (newTabPage) {
        newTabUrl = newTabPage.url();
        await newTabPage.bringToFront();
        await newTabPage.waitForTimeout(1000);
        /* Why don't show the newTab screenshot to Then step in reports? 2020-08-14 */
        // await page.screenshot({ path: path.join(config._rootPath, config.reportPath, 'newWindowScreen.png'), fullPage: true });
        // page['newWindowScreen'] = true;
        await newTabPage.close();
    }
    expect(newTabUrl).toBe(url);
});

/**
 * @playwright A new window is opened (It is a popup view), e.g. triggered by window.open() API, then verify the URL of the new window toBe expected
 * This is not same as verify new tab because the new window is opened immediately, so the popup was caught in previous "When" step, and passed by current page.
 * There could be a period before the page of the new popup to be stable, so we should put "When I wait {seconds}" before the varification
 * @param {string} url - The expected URL of the new tab or window
 * @throws - Expectation, or timeout error if no new tab or window opened in 30s
 */
 Then("I can see the new popup window {url} is opened", (url) => {
    let popupUrl = "No popup found";
    if (page.popup) {
        const popupPage = page.popup;
        popupUrl = popupPage.url();
        page.popup = undefined;
    }
    expect(popupUrl).toBe(url);
});

/**
 * @playwright Verify cookie items exist in current browser context by checking cookie-names, e.g. "JSSESSION,APIID,..."
 * @param {string} names - Given cookie names, separated by ","
 * @throws - Custom error for cookie not ecisted
 * @Note - The cookie names are verified by "CONTAIN" instead of "EQUAL".
 */
Then("I verify the cookies {names} existed", async (names) => {
    
    if (!names) {
        throw new TypeError(`Failed on passing args: names === ${names}`);
    }
    const existedCookies = await browser.cookies();     // Here browser is 'browserContext', can also get by page.context().
    const _names = names.split(',');
    const _existedCookies = existedCookies.map( (ck) => {
        return ck.name.trim();
    });
    for ( const name of _names ) {
        if ( _existedCookies.indexOf(name.trim()) === -1 ) {
            throw new TypeError(`Expected cookie (${name}) is not included in ${_existedCookies.join(",")}`);
        }
    }
    return true;
});

/**
 * @playwright Verify a cookie with given value exists in current page
 * @param {string} name - The given cookie name
 * @param {string} value - The expected value of the given cookie
 * @throws - Custom errors for cookie not found and value not matching
 */
Then("the cookie {name} with {value} available in current page", async (name, value) => {
    const existedCookies = await browser.cookies();
    
    for ( const _cookie of existedCookies ) {
        if ( `${_cookie.name}` === name && `${_cookie.value}` === value ) {
            return true;
        } else if ( `${_cookie.name}` === name && `${_cookie.value}` !== value ) {
            throw new TypeError(`Found cookie ${_cookie.name} with value ${_cookie.value}, but expected ${value}`);
        }
    }
    throw new TypeError(`Not found cookie ${name}`);
});

/**
 * @playwright Verify the XHR sent from testing context (not from browser UI actions) is responsed with given status (Mostly for API testing)
 * @param {string} status - The given HTTP status, e.g. "200", "401", ...
 * @Note - This step should cooperate with relevant When steps for waiting specified XHR resolved
 */
Then("I received response with {status} HTTP status", (status) => {
    expect(page.xhr.status).toBe(status);
});

/**
 * @playwright Verify the XHR sent from testing context (not from browser UI actions) is responsed with given data (Mostly for API testing)
 * @param {object | [object]} data - The expected data or data "partial".
 * @Note - The given data is verified by "Resolved-On-Reveived-Data" instead of "Equal" (all 'data' in data object are matched in model with same path and value)
 * @Note - This step should cooperate with relevant When steps for waiting specified XHR resolved
 */
Then("I received response with payload {data}", ( data ) => {

    // Copy xhr.data and extends probe data. it should be same as original xhr.data on matching
    const _model = deepExtend( {}, page.xhr.data);
    deepExtend(_model, data);

    if ( !_.isEqualWith( page.xhr.data, _model ) ) {
        page.errAttachment = JSON.stringify(data, null, 4);  // Formatted or not?
        // page.errAttachment = JSON.stringify(data);
        throw TypeError(`Received xhr response is not matching the following expected object`);
    }
});

/**
 * @playwright Verify if each of the specified container elements includes at least one content element.
 * This test is only available for xpath parameters (not other selectors, not Handow-probe) because it works basing on the DOM path hierachy.
 * @param {string} xpathContainer - the xpath of the container elements, e.g. //*[@id='container']
 * @param {string} xpathContent - the xpath of the child elements relative with the container, e.g. //img[@alt='small icon']
 * @throws - Custom errors 
 */
 Then("I can see all {xpathContainer} including {xpathContent}", async (xpathContainer, xpathContent) => {
    await page.waitForSelector(`${xpathContainer}`, { state: "visible", timeout: config.elementAppearTimeout });
    const containers = await page.$$(`${xpathContainer}`);

    if (containers && containers.length > 0) {
        try {
            /* Any timeout means the container not including the content */
            await promises.all( Object.keys(containers).map(
                (key, index) => page.waitForSelector(`${xpathContainer}[${index + 1}] ${xpathContent}`, { state: "visible", timeout: config.elementAppearTimeout })
            ));
        } catch (e) {
            throw new TypeError(`The content is not found in at least one container element`);
        }
        
    } else {
        throw new TypeError(`Container elements are not found`);
    }
    
});

/**
 * @plauywright Verify if a file exists in specific path
 * @param {string} file - file name
 * @param {string} folfer - the directory where the file exists, e.g. "C:\data\Downloads\" (Pay attention to escape path in parameter, "C:\\data\\Downloads\\")
 * @throws - Custom errors
 */
Then("I can find {file} in {folder}", async (file, folder) => {
    const filePath = path.join(`${folder}`, `${file}`);
    
    if ( !fs.existsSync(filePath) ) {
        throw new TypeError(`Cannot find the file in specified path.`);
    }
});


/**
 * Fake test
 */
Then("I am okay", async () => {
    await page.waitForTimeout( 100 );
    expect(true).toBe(true);
});
