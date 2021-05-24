'use strict';

const puppeteer = require('puppeteer');

/**
 * @module Launch a browser instace.
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

module.exports = async (options) => {
    const b = await puppeteer.launch({ ...defaultOptions, ...options });
    return b;
};