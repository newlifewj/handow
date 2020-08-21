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

Then("I can see it {selector} is displayed", async (selector) => {

    const html = await page.$$eval( selector, elements => elements[0].outerHTML );

        // throw new TypeError(`Expected html is displayed, got ${typeof html}`);
    // expect(html).toBeNull();
    expect(html).toBeDefined();
    // const html = await page.waitForSelector(selector, { visible: true, timeout: 10 });
    // expect(html).toBeDefined();
});

Then("I can see it {xpath} is displayed", async (xpath) => {
    await page.waitForXPath(xpath, { visible: true, timeout: 100 });
    const elements = await page.$x( xpath );
    expect(elements[0]).toBeDefined();
});

// Selector for check innerText, prefer using this
Then("I can see it {selector} is showing text {text}", async (selector, text) => {
    const _text = await page.$eval(selector, (el) => el.innerText);
    expect(_text).toBe(text);
});

// XPath for check innerText
Then("I can see it {xpath} is showing text {text}", async (xpath, text) => {
    /**
     * pptr use $eval evaalute selector, then get the text result, but can not do it on xpath.
     * Here we get 'JSHandles' after $x(xpath), it is JavaScript references.
     * Call getProperty() to get an object, and then exteact text by toString().
     * However, the text of the property object includes other extra strings like "JSHandle:[actual-text]".
     * That's why we have to use 'includes()' instead of equal compare.
     */
    const elements = await page.$x( xpath );

    // this got JSHandle:<text> pairs, not the text -- 2020/02/08
    // const prop = await elements[0].getProperty('innerText');
    
    const prop = await (await elements[0].getProperty('innerText')).jsonValue();
    expect(prop.trim()).toEqual(text.trim());
});

// TODO: Need xpath step
// TODO: Not working for selector not-existed
Then("I can see it {selector} is disappeared", async (selector) => {
    let html;
    try {
        html = await page.$$eval( selector, elements => elements[0].outerHTML );
    } catch (e) {
        html = null;
    }
    expect(html).toBeNull();
});

Then("I can see it {selector} is enabled", async (selector) => {
   await page.waitForSelector(`${selector}`, { visible: true, timeout: config.elementAppearTimeout });
   const elements = await page.$$(`${selector}`);
   const attr = await page.evaluate( el => el['disabled'], elements[0] );
   expect(`${attr}`).toBe('false');
});

Then("I can see it {selector} is disabled", async (selector) => {
   await page.waitForSelector(`${selector}`, { visible: true, timeout: config.elementAppearTimeout });
   const elements = await page.$$(`${selector}`);
   const attr = await page.evaluate( el => el['disabled'], elements[0] );
   expect(`${attr}`).toBe('true');
});

Then("I can see it {xpath} is enabled", async (xpath) => {
    await page.waitForXPath(`${xpath}`, { visible: true, timeout: config.elementAppearTimeout });
    const elements = await page.$x( xpath );
    const attr = await page.evaluate( el => el['disabled'], elements[0] );
    expect(`${attr}`).toBe('false');
});

Then("I can see it {xpath} is disabled", async (xpath) => {
    await page.waitForXPath(`${xpath}`, { visible: true, timeout: config.elementAppearTimeout });
    const elements = await page.$x( xpath );
    const attr = await page.evaluate( el => el['disabled'], elements[0] );
    expect(`${attr}`).toBe('true');
});

Then("I finished", async () => {
    await page.waitFor( 100 );
    expect(true).toBe(true);
});

Then("I see the address is url {url}", async (url) => {
    const addr = await page.url();
    expect(addr).toBe(url);
});

// cookies is cookie names string saperated with comma, e.g. "JSSESSION,APIID,..."
Then("I can see cookies {cookies} exist", async (cookies) => {
    const existedCookies = await page.cookies();
    const _cookies = cookies.split(',');
    const _existedCookies = existedCookies.map( (ck, index) => {
        return ck.name.trim();
    });
    for ( const name of cookies ) {
        if ( _existedCookies.indexOf(name.trim()) === -1 ) {
            throw new TypeError(`Failed on Expecting ${name} included in ${_existedCookies.join(",")}`);
        }
    }
    return true;
});

Then("I received response with status {status} HTTP status", (status) => {
    expect(page.xhr.status).toBe(status);
});

// Data partial verfication, data could be an array or object
/**
 * Compare data with model, make sure all 'data' in data object are matched in model with same path and value.
 */
Then("I received response with data {data}", ( data ) => {

    // Copy xhr.data and extends probe data. it should be same as original xhr.data on matching
    let _model = deepExtend( {}, page.xhr.data);
    _model = deepExtend(_model, data);

    if ( !_.isEqualWith( page.xhr.data, _model ) ) {
        page.errAttachment = JSON.stringify(data, null, 4);  // Formatted or not?
        // page.errAttachment = JSON.stringify(data);
        throw TypeError(`Received xhr response is not matching the following expected object`);
    }
});

Then("I can see them {xpath} sorted by order {order}", async (xpath, order) => {
    await page.waitForXPath(xpath, { visible: true, timeout: 100 });

    // Here elements are JSHandle object array
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

    /* Working now !!!
    const _textArray = [];
    for(const element of elements ) {
        _textArray.push( await (await element.getProperty('innerText')).jsonValue() );
    }
    */

    const textArray = [];
    for (const element of elements ) {
        textArray.push( await page.evaluate( el => el['innerText'], element ) );
    }

    const _order = order.toLowerCase();

    if (_order === "asc" || _order === "ascending" || _order === "ascend") {
        const _ta = [ ...textArray ];
        expect(textArray).toEqual(_ta.sort());

    } else if (_order === "desc" || _order === "descending" || _order === "descend") {
        const _ta = [...textArray];
        expect(textArray).toEqual(_ta.sort().reverse());

    } else {
        expect(order).toEqual("'valid ascending or descending keyword'");
    }
});

Then("I can see them {xpath} amount number {number}", async (xpath, number) => {
    await page.waitForXPath(xpath, { visible: true, timeout: 100 });
    const elements = await page.$x( xpath );

    expect(elements.length).toEqual(number);
});

Then("the cookie {cookiename} with value {value} available in current page", async (cookiename, value) => {
    const existedCookies = await page.cookies();
    
    for ( const _cookie of existedCookies ) {
        if ( _cookie.name == cookiename && _cookie.value == value ) {
            return true;
        } else if ( _cookie.name == cookiename && _cookie.value != value ) {
            throw new TypeError(`Found cookie ${_cookie.name} with value ${_cookie.value}, but expected ${value}`);
        }
    }

    throw new TypeError(`Not found cookie ${cookiename}`);
});

Then("I can see it {selector} is showing html {html}", async (selector, html) => {
    const _html = await page.$eval(selector, (el) => el.innerHTML);
    expect(_html).toBe(html);
});

Then("I can see it {selector} is showing content {content}", async (selector, content) => {
    const _text = await page.$eval(selector, (el) => el.innerText);
    expect(_text).toBe(content);
});

Then("I am okay", async () => {
    await page.waitFor( 100 );
});

/**
 * Test new tab or new window is opened by searching new tabs/windows to verify the URL is matching or not
 * 1, Don't care about it is noew tab or window, browsers cannot guarantee this
 * 2, After verified the new tab or window, we cloae it
 * 3, So we don't move foucus on the new opened tab or window the test it.
 * 4, If you do need test new opened page, custom this step by removing the close code block
 */
Then("I can see the new window url {url} is opened", async (url) => {
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
        await newTabPage.waitFor(1000);
        /* Why don't show the newTab screenshot to Then step in reports? 2020-08-14 */
        // await page.screenshot({ path: path.join(config._rootPath, config.reportPath, 'newWindowScreen.png'), fullPage: true });
        // page['newWindowScreen'] = true;
        await newTabPage.close();
    }

});


Then("I don not see it {selector} is displayed", async (selector) => {

    await page.waitForSelector(selector, { visible: true, timeout: 100 });
    const elements = await page.$( selector );
    expect(elements).toBeNull();

});

Then("I can see the input element {selector} value is text {text}", async (selector, text) => {
    
    const _value = await page.$eval(selector, (el) => el.value);
    expect(_value).toBe(text.trim());
});

Then("I don not see it {xpath} is displayed", async (xpath) => {

    await page.waitForXPath(xpath, { visible: true, timeout: 300 });
    const elements = await page.$x( xpath );
    expect(elements).toBeNull();

});

Then("I verify the property name {name} of it {selector} is value {value}",async (name, selector, value) => {
    const _element = await page.$(selector);
    const _value = await _element.getProperty(name);
    expect(await _value.jsonValue()).toBe(value.trim());
    
    /*
    const _value = await page.$eval(selector, (el) => el[name]);
    expect(_value).toBe(value.trim());
    */
});

Then("I verify the active style name {name} of it {selector} is value {value}",async (name, selector, value) => {
    /*
    const button = await page.evaluate(() => {
        const btn = document.querySelector('.button');
        return JSON.parse(JSON.stringify(getComputedStyle(btn)));
    });
*/
    const _stlValue = await page.evaluate( (sel) => {
        const _element = document.querySelector(sel);      // the 1st matched element
        const _styles = window.getComputedStyle(_element);
        // return _styles.getPropertyValue(name);
        return JSON.parse(JSON.stringify(_styles));
    }, selector );

    expect(_stlValue[name]).toBe(value.trim());
});
