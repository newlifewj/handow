'use strict';

const puppeteer = require('puppeteer');
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
    
    return b;
};