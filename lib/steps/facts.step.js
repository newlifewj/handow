'use strict';

// /* eslint-disable no-undef */

const Then = null;
const page = null;
const config = null;

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
    const prop = await elements[0].getProperty('innerText');
    expect(prop.toString().includes(text)).toBe(true);
});

Then("I can see it {selector} is disappered", async (selector) => {
    let html;
    try {
        html = await page.$$eval( selector, elements => elements[0].outerHTML );
    } catch (e) {
        html = null;
    }
    expect(html).toBeNull();
});

Then("I can see it {selector} is enabled", async (selector) => {
    const attr = await page.$$eval( `${selector}`, elements => elements[0].disabled );
    expect(attr).not.toBeDefined();
});

Then("I can see it {selector} is disabled", async (selector) => {
    const attr = await page.$$eval( `${selector}`, elements => elements[0].disabled );
    expect(attr).toBeDefined();
});

Then("I finished", async () => {
    expect(true).toBe(true);
});

Then("I see the address is url{url}", async (url) => {
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

Then("I am ok", () => {

});
