'use strict';

// const puppeteer = require('puppeteer');
const { chromium, firefox, webkit } = require('playwright');
const planConfig = require('./planConfig');

/**
 * @module launchBrowser Launch a browser instace.
 * @description launch a new browser instance
 */

/*
const defaultOptions = {
    args: [
        '--disable-setuid-sandbox',
        '--no-sandbox',
        // '--start-fullscreen',
        '--ignore-certificate-errors'     // So we can access https directly
    ],
    defaultViewport: null,
    ignoreHTTPSErrors: true,
    headless: true     // true: use headless Chrome; false: invoke real Chrome; 
};
*/
const defaultOptions = { };

/**
 * @exports launchBrowser default export function as browser launch
 * @param {object} options The options to instantiate the browser, it will override the default options
 * @returns browser instance
 */
module.exports = async (options) => {
    let b;
    if (`${planConfig.get().browser.trim().toLowerCase()}` === "firefox") {
        b = await firefox.launch({ ...defaultOptions, ...options });
    } else if (`${planConfig.get().browser.trim().toLowerCase()}` === "webkit") {
        b = await webkit.launch({ ...defaultOptions, ...options });
    } else {
        b = await chromium.launch({ ...defaultOptions, ...options });
    }

    const context = b.new_context();       // Actually it is the browser context launched
    
    return context;
};


/*
    1, Only one browser instance launched during test running.
    2, The browser instance must be closed after test running finished.
    3, For browserSessionScope!=="story", only one browser context is used to open all pages, so the browser context is closed only if whole plan finished.
    4, For browserSessionScope==="story", the browser will create new context to open a page for this story, and the context must be closed after the story finished.
*/