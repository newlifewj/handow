'use strict';

// const puppeteer = require('puppeteer');
const { chromium, firefox, webkit } = require('playwright');
const planConfig = require('./planConfig');
const pageManager = require('./pageManager.js');

/**
 * @module launchBrowser Launch a browser instace.
 * @description launch a new browser instance
 */
const defaultOptions = { };

let browser;    // The browser for whole plan running
let context;    // The context for whole plan running - plan scope context
module.exports = {
    launchBrowser: async (options) => {
        if (`${planConfig.get().pwtAPI.trim().toLowerCase()}` === "firefox") {
            browser = await firefox.launch({ ...defaultOptions, ...options });
        } else if (`${planConfig.get().pwtAPI.trim().toLowerCase()}` === "webkit") {
            browser = await webkit.launch({ ...defaultOptions, ...options });
        } else {
            browser = await chromium.launch({ ...defaultOptions, ...options });
        }

        return browser;
    },

    closeBrowser: async () => {
        if (browser) {
            if (context) {
                const openedPages = await context.pages();
                await Promise.all( openedPages.map( (page) => pageManager.close(page) ) );
                await context.close();
                context = null;
            }
            await browser.close();
            browser = null;
            context = null;

        } else {
            browser = null;
            context = null;
            throw new TypeError("@contextManager.js - No browser instance");

        }

    },

    /**
     * Get the plan context, create it if it not exist
     * @param {object} options Optional, custom config for the creating the plan scope context
     * @returns {object} The plan scope context
     */
    context: async (options) => {
        if (context) {
            return context;
        } else if (browser) {
            /* Create the plan scope context */
            context = await browser.newContext({ ignoreHTTPSErrors: true, bypassCSP: true, ...options });

            /*
                Timeout is critical for Promise resoving, it prevent the infinit waiting.
                The default Timeout value is 30s, it will be implement all promises resolving.
                Here the built-in DefaultTimeout is overriden by config.defaultTimeout.
                So, all promise resolving will use the config.defaultTimeout if not specified.
            */
            context.setDefaultTimeout( planConfig.get().defaultTimeout );
            return context;
        } else {
            throw new TypeError("@contextManager.js - No browser instance");
        }
    },

    /**
     * Create a new clean context to replace current plan scope context
     * @param {object} options Custom config for the new clean context
     * @returns {object} The clean context
     */
    cleanContext: async (options) => {
        if (context) {
            const openedPages = await context.pages();
            await Promise.all(openedPages.map( (page) => pageManager.close(page) ));
            await context.close();
        }
        context = await browser.newContext();     // Renew the plan context
        return context;
    },

    clearContextCookies: async () => {
        if (context) {
            await context.clearCookies();
        } else {
            throw new TypeError("@contextManager.js - No browser context");
        }
    },

    newContext: async (options) => {
        if (browser) {
            const newContext = await browser.newContext({ ignoreHTTPSErrors: true, bypassCSP: true, ...options });
            newContext.setDefaultTimeout(planConfig.get().defaultTimeout);
            return newContext;
        } else {
            throw new TypeError("@contextManager.js - No browser instance");
        }
    },

    /**
     * Close specified context, especially for the story scoped context
     * @param {*} cntxt
     */
    closeContext: async (cntxt) => {
        const openedPages = await cntxt.pages();
        await Promise.all(openedPages.map( (page) => pageManager.close(page) ));
        await cntxt.close();
    }
};

/*
    1, Only one browser instance launched during test running.
    2, The browser instance must be closed after test running finished.
    3, For browserSessionScope!=="story", only one browser context is used to open all pages, so the browser context is closed only if whole plan finished.
    4, For browserSessionScope==="story", the browser will create new context to open a page for this story, and the context must be closed after the story finished.
*/