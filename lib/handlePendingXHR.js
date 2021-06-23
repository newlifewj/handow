/* eslint-disable no-use-before-define */
'use strict';

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
                return;
            }
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
