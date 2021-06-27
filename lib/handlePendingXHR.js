/* eslint-disable no-use-before-define */
'use strict';

/**
 * @module handlePendingXHR Add abbility to a page to handle pending XHRs
 * @param {object} page - current page object
 * @param {string} cmd - command to enable the page handle pending XHRs or remove all the pending heandlers from page.
 * @note Handle pending XHR could be required in some situation, but mostly we don't need it.
 * 1, Some built-in events have considered XHR pending already. For example, 'await page.evaluate(... click ...)', playwright will resove the 'click'
 * together with all consequential pending XHRs. That means we needn't handle the pending XHR especially.
 * 2, However, the build-in pending XHR handling mechanism is not reliable and differently per browsers, e.g., the Firfox doesn't resove pending XHRs with 'click'.
 * 3, So it is a good experience to add the 'resolve pending XHR' after actions trigger long pending XHR. It is harmless.
 * 4, Actually, test steps without handling pending XHR will work in most situation, because the verification steps always 'await selector appear ...'.
 * 5, Anyway, handle pending XHR step is optional, it could be a help when this happened in the test running
 * 6, Even we set 'await page.waitPendingXHR()' in test flow, there are still some XHRs fired after this statement, so it is not a trustful solution, just a help.
 * @description handlePendingXHR is a middleware in page lifecycle. If the 'Waiting Pending XHR Resolved' is required the test steps on a page, must add this middleware
 * to the page by 'handlePendingXHR(page, "on");'. After added this middleware, any step on this page can call 'await page.waitPendingXHR()' to synchronize XHRs resolving.
 * And the "I wait all pending requests resolved in {seconds}" and "I wait all pending requests resolved" steps are available. This middleware is controlled by
 * 'config.handlePendingXHR', which is enabled by default, but user can change it to false. !!! Don't do that normally"
 */
module.exports = (page, cmd) => {
    if (`${cmd}` === "on") {
        page["pendingXHR"] = 0;
        page["pendingPromises"] = [];

        page.on('request', requestListener);

        page.on('requestfailed', requestfailedfinishedListener);

        page.on('requestfinished', requestfailedfinishedListener);

        /*
            Attach 'waitPendingXHR' method to the opened page, so that the page has the abillity - 'await page.waitPendingXHR()'
        */
        page["waitPendingXHR"] = async () => {
            if (page["pendingXHR"] === 0) {
                return;     // No pending XHR (resoved already)
            }
            /*
                Start wait and resolve the pending XHRs in current pending list. The XHRs will be resolved "on-requestfinished" or "on-requestFailed"
            */
            await Promise.all(page["pendingPromises"]);
        };

        page["countPendingXHR"] = () => page["pendingXHR"];

    } else if (`${cmd}` === "off") {
        page.removeListener('request', requestListener);
        page.removeListener('requestfailed', requestfailedfinishedListener);
        page.removeListener('requestfinished', requestfailedfinishedListener);

    } else {
        // Never come here
    }
    
    function requestListener (request) {
        if (request.resourceType() === 'xhr') {
            page["pendingXHR"] = page["pendingXHR"] + 1;
            /*
                Add the resolver to pending list
            */
            page["pendingPromises"].push(
                new Promise( resolve => {
                    request.pendingXhrResolver = resolve;
                    setTimeout(() => {
                        resolve();      // Resolve the promise after 30 seconds to make test continue
                    }, 30000);
                } )
            );
        }
    }

    function requestfailedfinishedListener (request) {
        if (request.resourceType() === 'xhr') {
            if ( request.pendingXhrResolver ) {
                request.pendingXhrResolver();   // Resolve the promise
            }
            delete request.pendingXhrResolver;
            page["pendingXHR"] = page["pendingXHR"] > 0 ? page["pendingXHR"] - 1 : 0;
        }
    }
};
