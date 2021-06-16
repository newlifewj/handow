'use strict';

const puppeteer = require('puppeteer');

/**
 * @module launchBrowser Launch a browser instace.
 * @description launch a new browser instance
 */

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

/**
 * @exports launchBrowser default export function as browser launch
 * @param {object} options The options to instantiate the browser, it will override the default options
 * @returns browser instance
 */
module.exports = async (options) => {
    const b = await puppeteer.launch({ ...defaultOptions, ...options });
    return b;
};