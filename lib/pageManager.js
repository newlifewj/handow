'use strict';

/**
 * @module pageManager Manage pages 
 * @description An object to provide APIs for pages control
 */
const path = require('path');
const https = require('https');
const config = require('./planConfig').get();
const handlePendingXHR = require('./handlePendingXHR.js');
const httpAgent = require('axios').create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

/**
 * @exports pageManager default export object for all page APIs
 */
module.exports = {
    /**
     * 
     * @param {object} context The browser context for current story, either plan scoped or story scoped
     * @returns {object} The new opened page
     */
    open: async (context) => {
        const page = await context.newPage();
        let viewport;

        if (config.viewport === 'mobile') {
            // deviceScaleFactor control screenshot shrink, e.g. 0.1 means resize to 1/10 in width and height.
            viewport = { width: 480, height: 720, deviceScaleFactor: 1 };
        } else if (config.viewport === 'desktop') {
            viewport = { width: 1366, height: 768, deviceScaleFactor: 1 };
        } else if (config.viewport.split(/[xX]/).length === 2) {
            viewport = {
                width: parseInt(config.viewport.split(/[xX]/)[0].trim()),
                height: parseInt(config.viewport.split(/[xX]/)[1].trim())
            };
        } else {
            viewport = { width: 1024, height: 768 };
        }

        if (config.touchScreen) {
            viewport["hasTouch"] = true;
        }

        // await page.setViewport(viewport);

        // Let page bring more to step running context 
        // page["pendingXHR"] = new PendingXHR(page);
        handlePendingXHR(page, "on");
        page["axios"] = httpAgent;
        page["newWindowScreen"] = false;

        return page;
    },

    close: async (page) => {
        if (page["waitPendingXHR"] ) {
            handlePendingXHR(page, "off");
        }
        await page.close();
    },

    screenshot: async (page, name) => {
        const timestamp = Date.now();
        const screenName = `${name}_${timestamp}.png`;
        try {
            await page.screenshot({ path: path.join(config._rootPath, config.reportPath, `${screenName}`), fullPage: true });
            return screenName;
        } catch (e) {
            return screenName;
        }
    },

    cookies: async (page) => {
        const context = page.context();
        const url = page.url();
        const cookies = await context.cookies(url);
        return cookies;
    },

    xhrRecord: (page) => {
        return {
            data: page.xhr.data ? page.xhr.data : null,
            status: page.xhr.status ? page.xhr.status : "Unrecognized",
            headers: page.xhr.headers ? page.xhr.headers : [],
            request: {
                path: page.xhr.request && page.xhr.request.path ? page.xhr.request.path : "Unrecognized",
                headers: page.xhreq && page.xhreq.headers ? page.xhreq.headers : [],
                method: page.xhreq && page.xhreq.method ? page.xhreq.method : "Unrecognized",
                body: page.xhreq && page.xhreq.data ? page.xhreq.data : null
            }
        };
    }
};
