'use strict';

/* eslint-disable no-undef */

// References will inject to step contex in running time
const browser = null;
const page = null;
const config = null;
const Then = null;

const expect = require('expect');
const _ = require('lodash');
const deepExtend = require('deep-extend');
// eslint-disable-next-line node/no-missing-require
const handow = require('handow');   // The handow module is improted in run time, not current path

/**
 * Verify URL address of current page
 * @param {string} url - URL
 * @throws - Expectation
 */
Then("I see the address is {url}", async (url) => {
    const addr = await page.url();
    expect(addr).toBe(url);
});

Then("I stop test running", () => {
    handow.stop();
});

/**
 * Verify the elements exist in current page, no matter of it is hadden or empty
 * @param {string} selector - Valid css-selector or Handow-probe to specify the elements
 * @throws - Expectation
 */
Then("I verify {selector} exist", async (selector) => {
    try {
        const html = await page.$$eval( selector, elements => elements[0].outerHTML );
        expect(html).toBeDefined();
            // throw new TypeError(`Expected html is displayed, got ${typeof html}`);
        // expect(html).toBeNull();
        
        // const html = await page.waitForSelector(selector, { visible: true, timeout: 10 });
        // expect(html).toBeDefined();
    } catch (e) {
        throw new TypeError(`Element doesn't exist`);
    }
    
});

/**
 * Verify the elements exist in current page, no matter of it is hadden or empty
 * @param {string} xpath - Valid css-selector or Handow-probe to specify the elements
 * @throws - Expectation
 */
Then("I verify {xpath} exist", async (xpath) => {
    try {
        const elements = await page.$x( xpath );
        expect(elements[0]).toBeDefined();
    } catch (e) {
        throw new TypeError(`Element doesn't exist`);
    }
});

/**
 * Verify the specified elements exist and visible (not hidden or none-display), wait the expected result in given time
 * @param {string} selector - Valid css-selector or Handow-probe
 * @throws - Expectation and custom timeout error if, finally, elements not displayed
 */
Then("I can see {selector} is displayed", async (selector) => {
    try {
        await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
        
    } catch (e) {
        throw new TypeError(`Timeout (${config.elementAppearTimeout}ms) for waiting element displayed`);
    }
});

/**
 * Verify the specified elements exist and visible (not hidden or none-display), wait the expected result in given time
 * @param {string} xpath - Valid xpath or Handow-probe
 * @throws - Expectation and custom timeout error if, finally, elements not displayed
 */
Then("I can see {xpath} is displayed", async (xpath) => {
    try {
        const element = await page.waitForXPath(xpath, { visible: true, timeout: config.elementAppearTimeout });
    } catch (e) {
        throw new TypeError(`Timeout (${config.elementAppearTimeout}ms) for waiting element displayed`);
    }
});

/**
 * Verify the specified elements exist and visible (not hidden or none-display), wait the expected result in given time
 * @param {string} selector - Valid css-selector or Handow-probe
 * @throws - Expectation and custom timeout error if, finally, elements not displayed
 */
 Then("I can see {selector} presenting", async (selector) => {
    try {
        await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
        
    } catch (e) {
        throw new TypeError(`Timeout (${config.elementAppearTimeout}ms) for waiting element displayed`);
    }
});

/**
 * Verify the specified elements exist and visible (not hidden or none-display), wait the expected result in given time
 * @param {string} xpath - Valid xpath or Handow-probe
 * @throws - Expectation and custom timeout error if, finally, elements not displayed
 */
Then("I can see {xpath} presenting", async (xpath) => {
    try {
        const element = await page.waitForXPath(xpath, { visible: true, timeout: config.elementAppearTimeout });
    } catch (e) {
        throw new TypeError(`Timeout (${config.elementAppearTimeout}ms) for waiting element displayed`);
    }
});

/**
 * Verify the specified elements NOT exist or disappeared (hidden or none-display), wait the expected result in given time
 * @param {string} selector - Valid css-selector or Handow-probe
 * @throws - Expectation and custom timeout error if, finally, the elements exist and visible
 */
 Then("I cannot see {selector}", async (selector) => {
    try {
        await page.waitForSelector(selector, { visible: true, timeout: config.elementAbsentTimeout });
        throw new TypeError("_Elemnt_Visible_");
    } catch (err) {
        // Timeout means positive result for element invisible test
        if (`${err}`.includes("_Elemnt_Visible_")) {
            throw new TypeError(`Element is visible in (${config.elementAbsentTimeout}ms) watching period`);
        }
    }
});

/**
 * Verify the specified elements NOT exist or invisible (hidden or none-display), wait the expected result in given time
 * @param {string} xpath - Valid xpath or Handow-probe
 * @throws - Expectation and custom timeout error if elements exist and visible
 */

Then("I cannot see {xpath}", async (xpath) => {
    try {
        await page.waitForXPath(xpath, { visible: true, timeout: config.elementAbsentTimeout });
        throw new TypeError("_Elemnt_Visible_");
    } catch (err) {
        // Timeout means positive result for element invisible test
        if (`${err}`.includes("_Elemnt_Visible_")) {
            throw new TypeError(`Element is visible in (${config.elementAbsentTimeout}ms) watching period`);
        }
    }
});


/**
 * Verify if the visible content (showing on screen) of specified element CONTAIN given text
 * @param {string} selector - Valid css-selector or Handow-probe
 * @param {string} text - text content
 * @throws - Custom errors
 */
Then("I can see {selector} is showing {text}", async (selector, text) => {
        // Wait element appear and visible
        await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
        const _text = await page.$eval(selector, (el) => el.innerText);
        if ( !( _text.includes(text) ) ) {
            throw new TypeError(`The given text is not showing in element inner content`);
        }
});

/**
 * Verify if the visible content (showing on screen) of specified element CONTAIN given text
 * @param {string} xpath - Valid xpath or Handow-probe
 * @param {string} text - text content
 * @throws - Custom errors
 */
Then("I can see {xpath} is showing {text}", async (xpath, text) => {
    await page.waitForXPath(xpath, { visible: true, timeout: config.elementAppearTimeout });
    /**
     * pptr use $eval evalute selector, then get the text result, but can not do it on xpath.
     * Here we get 'JSHandles' after $x(xpath), it is JavaScript references.
     * Call getProperty() to get an object, and then exteact text by toString().
     * However, the text of the property object includes other extra strings like "JSHandle:[actual-text]".
     * That's why we have to use 'includes()' instead of equal compare.
     */
    const elements = await page.$x( xpath );
    
    const _innerText = await (await elements[0].getProperty('innerText')).jsonValue();
    if ( !( _innerText.includes(text) ) ) {
        throw new TypeError(`The given text is not showing in element inner content`);
    }
});

/**
 * Verify element contains given HTML block, no matter the HTML block is visible or not
 * @param {string} selector - Valid css-selector or Handow-probe
 * @param {string} html - HTML snippet
 * @throws - Expeaction
 */
Then("I verify {selector} contains {html}", async (selector, html) => {
    const _html = await page.$eval(selector, (el) => el.innerHTML);
    expect(_html).toBe(html);
});

/**
 * Verify element contains given HTML block, no matter the HTML block is visible or not
 * @param {string} xpath - Valid xpath or Handow-probe
 * @param {string} html - HTML snippet
 * @throws - Expeaction
 */
Then("I verify {xpath} contains {html}", async (xpath, html) => {
    const elements = await page.$x( xpath );
    
    const _innerHTML = await (await elements[0].getProperty('innerHTML')).jsonValue();
    expect(_innerHTML).toEqual(html);
});

/**
 * Verify given number elments exist in current page
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
 * Verify given number elments exist in current page
 * @param {number} number - The given number for expected elements
 * @param {string} xpath - Valid xpath or Handow-probe
 * @throws - Expectation and timeout error
 */
Then("I can see {number} items of {xpath} exist", async (number, xpath) => {
    await page.waitForXPath(xpath, { timeout: config.elementAppearTimeout });
    const elements = await page.$x( xpath );

    expect(elements.length).toEqual(number);
});

/**
 * Verify the visible text content of specified elements are sorted by given alphabet order
 * @param {string} selector - Valid selector or Handow-probe
 * @param {string} order - Sorting code, lower/upper cases of "asc, desc, ascending, descending"
 * @throws - Expectation and timeout error in configured time
 */
Then("I can see {selector} sorted by {order}", async (selector, order) => {
    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });

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
 * Verify the visible text content of specified elements are sorted by given alphabet order
 * @param {string} xpath - Valid xpath or Handow-probe
 * @param {string} order - Sorting code, lower/upper cases of "asc, desc, ascending, descending"
 * @throws - Expectation and timeout error in configured time
 */
Then("I can see {xpath} sorted by {order}", async (xpath, order) => {
    await page.waitForXPath(xpath, { visible: true, timeout: config.elementAppearTimeout });

    // Here elements are JSHandle object array (ElementHandle array?)
    const elements = await page.$x( xpath );

    /* Not working, got Promise object
    const testArray = elements.map( async (el) => await el.getProperty('innerText') );
    */

    /* Not working too, got "JSHandle:<text>" pairs array
    const textArray = [];
    for(const element of elements ) {
        textArray.push( await element.getProperty('innerText') );
    }
    */

    /* Working now
    const _textArray = [];
    for(const element of elements ) {
        _textArray.push( await (await element.getProperty('innerText')).jsonValue() );
    }
    */

    const textArray = [];
    for (const element of elements ) {
        textArray.push( await page.evaluate( el => el['innerText'].trim(), element ) );
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
 * Verify the specified input-able element with given value
 * @param {string} selector - Valid selecor or Handow-probe
 * @param {string} text - Given value
 * @throws - Expectation and timeout error
 * @Note - Input value and expected value are trim() before compared
 */
Then("I can see the input {selector} value equals {text}", async (selector, text) => {
    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
    const _value = await page.$eval(selector, (el) => el.value);
    expect(_value.trim()).toBe(text.trim());
});

/**
 * Verify the specified input-able element with given value
 * @param {string} xpath - Valid xpath or Handow-probe
 * @param {string} text - Given value
 * @throws - Expectation and timeout error
 * @Note - Input value and expected value are trim() before compared
 */
Then("I can see the input {xpath} value equals{text}", async (xpath, text) => {
    await page.waitForXPath(xpath, { visible: true, timeout: config.elementAppearTimeout });

    const elements = await page.$x( xpath );
    const _value = await page.evaluate( el => el.value, elements[0] );
    expect(_value.trim()).toBe(text.trim());
});

/**
 * Verify the visible element is enabled (check the "disabled" attrubute actually)
 * @param {string} selector - Valid selector or Handow-probe
 * @throws - Expectation and timeout error
 */
Then("I can see {selector} is enabled", async (selector) => {
   await page.waitForSelector(`${selector}`, { visible: true, timeout: config.elementAppearTimeout });
   const elements = await page.$$(selector);
   const attr = await page.evaluate( el => el['disabled'], elements[0] );
   expect(`${attr}`).toBe('false');
});

/**
 * Verify the visible element is enabled (check the "disabled" attrubute actually)
 * @param {string} xpath - Valid xpath or Handow-probe
 * @throws - Expectation and timeout error
 */
Then("I can see {xpath} is enabled", async (xpath) => {
    await page.waitForXPath(xpath, { visible: true, timeout: config.elementAppearTimeout });
    const elements = await page.$x( xpath );
    const attr = await page.evaluate( el => el['disabled'], elements[0] );
    expect(`${attr}`).toBe('false');
});

/**
 * Verify the visible element is disabled
 * @param {string} selector - Valid selector or Handow-probe
 * @throws - Expectation and timeout error
 */
Then("I can see {selector} is disabled", async (selector) => {
   await page.waitForSelector(`${selector}`, { visible: true, timeout: config.elementAppearTimeout });
   const elements = await page.$$(`${selector}`);
   const attr = await page.evaluate( el => el['disabled'], elements[0] );
   expect(`${attr}`).toBe('true');
});

/**
 * Verify the visible element is disabled
 * @param {string} xpath - Valid xpath or Handow-probe
 * @throws - Expectation and timeout error
 */
Then("I can see {xpath} is disabled", async (xpath) => {
    await page.waitForXPath(`${xpath}`, { visible: true, timeout: config.elementAppearTimeout });
    const elements = await page.$x( xpath );
    const attr = await page.evaluate( el => el['disabled'], elements[0] );
    expect(`${attr}`).toBe('true');
});

/**
 * Verify the given DOM property with given value exists in specified element (no matter it is visible or not)
 * @param {string} name - The property name
 * @param {string} value - The expected value of the given property
 * @param {string} selector - Valid css-selector or Handow-probe
 * @throws - Expectation
 */
Then("I verify the property {name} of {selector} equals {value}", async (name, selector, value) => {
    await page.waitForSelector(`${selector}`, { visible: true, timeout: config.elementAppearTimeout });
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
    const element = await page.$(selector);
    const attrValue = await page.evaluate( (el, attr) => el.getAttribute(attr), element, name );
    expect(`${attrValue}`).toBe(`${value.trim()}`);
});

/**
 * Verify the given DOM property with given value exists in specified element (no matter it is visible or not)
 * @param {string} name - The property name
 * @param {string} value - The expected value of the given property
 * @param {string} xpath - Valid xpath or Handow-probe
 * @throws - Expectation
 */
Then("I verify the property {name} of {xpath} equals {value}", async (name, xpath, value) => {
    await page.waitForXPath(`${xpath}`, { visible: true, timeout: config.elementAppearTimeout });
    /* not work well
    const _elements = await page.$x(xpath);
    const _value = await _elements[0].getProperty(name);
    expect(await _value.jsonValue()).toBe(value.trim());
    */
    
    const elements = await page.$x( xpath );
    const attrValue = await page.evaluate( (el, attr) => el.getAttribute(attr), elements[0], name );
    expect(`${attrValue}`).toBe(`${value.trim()}`);
});

/**
 * Verify the given computed style is active on specified elements (Selector-Only) currently.
 * @param {string} name - The given style property name
 * @param {string} value - The given value of the style
 * @param {string} selector - Valid css-selector (NO HANDOW_PROBE)
 * @throws - Expectation
 */
Then("I verify the active style {name} of {selector} is {value}", async (name, selector, value) => {

    const _stlValue = await page.evaluate( (sel) => {
        const _element = document.querySelector(sel);      // the 1st matched element
        const _styles = window.getComputedStyle(_element);
        // return _styles.getPropertyValue(name);
        return JSON.parse(JSON.stringify(_styles));
    }, selector );

    expect(_stlValue[name]).toBe(value.trim());
});

/**
 * Verify a new tab or window is opened (by searching new tabs/windows and check the URL is matching or not)
 * 1, Don't care about it is new tab or window, browsers cannot guarantee this
 * 2, The new tab or windows are closed after this step
 * 3, Will not move foucus on the new opened tab or window, so we don't test elements in the new tab or window.
 * 4, If you do need test new opened page, custom this step by removing the close code block and ...
 * @param {string} url - The expected URL of the new tab or window
 * @throws - Expectation, or timeout error if no new tab or window opened in 30s
 */
Then("I can see the new window {url} is opened", async (url) => {
    const newTab = await browser.waitForTarget(
        (target) => {
            return `${target.url()}` === `${url}`;
        },
        config.navigatingTimeout
    );

    expect(newTab.type()).toBe("page");
    // Close the new opened target
    if (newTab) {
        const newTabPage = await newTab.page();
        await newTabPage.bringToFront();
        await newTabPage.waitForTimeout(1000);
        /* Why don't show the newTab screenshot to Then step in reports? 2020-08-14 */
        // await page.screenshot({ path: path.join(config._rootPath, config.reportPath, 'newWindowScreen.png'), fullPage: true });
        // page['newWindowScreen'] = true;
        await newTabPage.close();
    }
});

/**
 * Verify cookie items exist in current page by checking cookie-names, e.g. "JSSESSION,APIID,..."
 * @param {string} names - Given cookie names, separated by ","
 * @throws - Custom error for cookie not ecisted
 * @Note - The cookie names are verified by "CONTAIN" instead of "EQUAL".
 */
Then("I verify the cookies {names} exist", async (names) => {
    if (!names) {
        throw new TypeError(`Failed on passing args: names === ${names}`);
    }
    const existedCookies = await page.cookies();
    const _names = names.split(',');
    const _existedCookies = existedCookies.map( (ck) => {
        return ck.name.trim();
    });
    for ( const name of _names ) {
        if ( _existedCookies.indexOf(name.trim()) === -1 ) {
            throw new TypeError(`Failed on Expecting cookie (${name}) included in ${_existedCookies.join(",")}`);
        }
    }
    return true;
});

/**
 * Verify a cookie with given value exists in current page
 * @param {string} name - The given cookie name
 * @param {string} value - The expected value of the given cookie
 * @throws - Custom errors for cookie not found and value not matching
 */
Then("the cookie {name} with {value} available in current page", async (name, value) => {
    const existedCookies = await page.cookies();
    
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
 * Verify the XHR sent from testing context (not from browser UI actions) is responsed with given status (Mostly for API testing)
 * @param {string} status - The given HTTP status, e.g. "200", "401", ...
 * @Note - This step should cooperate with relevant When steps for waiting specified XHR resolved
 */
Then("I received response with {status} HTTP status", (status) => {
    expect(page.xhr.status).toBe(status);
});

/**
 * Verify the XHR sent from testing context (not from browser UI actions) is responsed with given data (Mostly for API testing)
 * @param {object | [object]} data - The expected data or data "partial".
 * @Note - The given data is verified by "Resolved-On-Reveived-Data" instead of "Equal" (all 'data' in data object are matched in model with same path and value)
 * @Note - This step should cooperate with relevant When steps for waiting specified XHR resolved
 */
Then("I received response with payload {data}", ( data ) => {

    // Copy xhr.data and extends probe data. it should be same as original xhr.data on matching
    let _model = deepExtend( {}, page.xhr.data);
    deepExtend(_model, data);

    if ( !_.isEqualWith( page.xhr.data, _model ) ) {
        page.errAttachment = JSON.stringify(data, null, 4);  // Formatted or not?
        // page.errAttachment = JSON.stringify(data);
        throw TypeError(`Received xhr response is not matching the following expected object`);
    }
});

/**
 * Verify if each of the specified elements includes at least one another element.
 * This test is only available for xpath parameters because it works basing on the DOM path hierachy.
 * @param {string} xpath1 - the xpath of the container elements, e.g. //*[@id='container']
 * @param {string} xpath2 - the xpath of the child elements relative with the container, e.g. //img[@alt='small icon']
 * @throws - Custom errors 
 */
 Then("I can see all {xpath1} including {xpath2}", async (xpath1, xpath2) => {
    const containers = await page.waitForXPath(xpath1, { visible: true, timeout: config.elementAppearTimeout });
    const children = await page.waitForXPath(`${xpath1} ${xpath2}`, { visible: true, timeout: config.elementAppearTimeout });
    if (!containers) {
        throw new TypeError(`The container elements are not existed.`); 
    } else {
        expect(containers.length).toEqual(children ? children.length : 0);
    }
    
});

/**
 * Verify if a file exists in specific path
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
