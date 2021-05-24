'use strict';

/**
 * @module storyRunr Run a story object
 */
const fs = require('fs');
const https = require('https');
const puppeteer = require('puppeteer');
const { PendingXHR } = require('pending-xhr-puppeteer');
const deepExtend = require('deep-extend');
const path = require('path');

const stepRunr = require('./stepRunr');
const cnsl = require('./honsole');
const eventBus = require('./eventBus');
const record = require('./record');
const glob = require('glob');
const launchBrowser = require('./launchBrowser.js');

// const config = deepExtend( require('./_config'), require('../config') );
const config = require('./planConfig').get();
const httpAgent = require('axios').create({
    httpsAgent: new https.Agent({  
      rejectUnauthorized: false
    })
});

/**
 * Condition evaluator.
 * Apply current story data and also the skip condition to this function to resolve the skip logic
 */
function evalSkip() {
    if ( `${process.env.HDW_BREAK}` === 'true' ) {
        return true;    // "HDW_BREAK" will skip all phases and steps
    } else {
        return eval(this.skip);
    }
}

/**
 * Story runner
 *
 * @param {suite} - story object by parsing story file.
 * @param {params} - k-v pair object from global parameters, will inject into story and scenario data pool
 * @param {staIdx} - stage number of current running plan, which current suite belong to. (just for SSE streaming)
 * @return {Promise} Report is updated along with story running, and output to console by specified.
 */
// TODO: Access the report object.
// TODO: Output to websocket endpoint ( in the future )
module.exports = async ( suite, params, planBrowser ) => {

    // ***************** Before all **************
        let browser;
        let page;
        // const screenshot = process.env.screenshot ? process.env.screenshot.toLowerCase() : 'none';
        /*
        const viewport = process.env.device === 'mobile'
                    ? { width: 480, height: 720, deviceScaleFactor: 1 }
                    :  process.env.device === 'desktop'
                    ? { width: 1200, height: 800, deviceScaleFactor: 1 }
                    : { width: 800, height: 600 };
        */
        let viewport;
        if ( config.viewport === 'mobile' ) {
            // deviceScaleFactor control screenshot shrink, e.g. 0.1 means resize to 1/10 in width and height.
            viewport = { width: 480, height: 720, deviceScaleFactor: 1 };
        } else if ( config.viewport === 'desktop' ) {
            viewport = { width: 1366, height: 768, deviceScaleFactor: 1 };
        } else if (config.viewport.split(/[xX]/).length === 2) {
            viewport = {
                width: parseInt(config.viewport.split(/[xX]/)[0].trim()),
                height: parseInt(config.viewport.split(/[xX]/)[1].trim())
            };
            // console.log(JSON.stringify(viewport, null, 4));
        } else {
            viewport = { width: 1024, height: 768 };
        }

        if ( config.touchScreen ) {
            viewport["hasTouch"] = true;
        }
// 2021-05-08 planBrowser feature

        if (!planBrowser) {
            console.log("-----------------launch stroyBrowser")
            browser = await launchBrowser({ headless: config.headlessChromium });
        } else {
            browser = planBrowser
        }
// 2021-05-08 planBrowser feature

        // THINKING: the defaultBrowserContext is incognito or not?
        // const context = await browser.defaultBrowserContext();
        // Open a new context will show 2 windows, not necessary to open new IncognitoBrowserContext??
        // const context = await browser.createIncognitoBrowserContext();
        let context;
        if ( "plan" !== `${config.browserSessionScope.trim()}` ) {
        /* if ( config.newIncognitoContext === true ) { */
            context = await browser.createIncognitoBrowserContext();
        } else {
            context = await browser.defaultBrowserContext();
        }
/*
        const pages = await context.pages();

        // THINKING: The new context of the new launched browser shouldn't have any pages open.
        if (pages.length > 0) {
            page = pages[0];
        } else {
            page = await context.newPage();
        }
*/
//      2021-05-19 always create new page ???
        page = await context.newPage();


        // page = await browser.newPage();  // Use page in default context.
        await page.setViewport( viewport );

/*
        // Set dialog listener; the dialog instance will be accessed by dialog steps
        page.on("dialog", (dlg) => {
            page["dialog"] = dlg;   // add 'dialog' to page
            // dlg.accept();
        });
*/
        // Let page bring more to step running context 
        page["pendingXHR"] = new PendingXHR(page);
        page["axios"] = httpAgent;
        page["newWindowScreen"] = false;

        // Inject all global params to the scenario data pool
        let globalData = params ? { ...params } : {};
    // *********************************************

        let _givenLoopCount = 0;
        const _givenLoops = suite.given.parameters.length;

        // ---------------------- record --------------------
        record.startStory(suite);
        // --------------------------------------------------

        // ---- honsole ----
        cnsl.wrapBlock( "given", `${suite.story}`, _givenLoops );
        // --------------

// ---------- Listen console event of the page to record errors ----------2020-08-29
if ( config.pageErrors ) {
    page["cnslErrors"] = []; 
    page.on('console', msg => {
        // For some reasons, some errors on Chrome are "warning" type in pptr
        if ( `${msg.type()}` === 'error' || `${msg.type()}` === 'warning' ) {
            page["cnslErrors"].push(`${msg.text()}`);
        }
    });
}
// -----------------------------------------------------------------------
        // Given looping - story level loop
        for ( let l = 0; l < suite.given.parameters.length; l++ ) {
            const params = suite.given.parameters[l];

            // update storyData with the Given loop params, it is available for whole story
            let storyData = deepExtend( { ...globalData }, params );

// ===========> steps status, for SSE
            const sseActs = [];
            const sseFacts = [];
// <===================================================================

            let storyLoopStatus = true;
            // ------------> Start Given actss --------------------
            for ( let i = 0; i < suite.given.acts.length; i++ ) {
                const act = suite.given.acts[i];

                // Clear xhr record existed in page
                page.xhr = null;

                // Add @skip expression as a field of current story data, then apply them to evaluate the condition.
                storyData["skip"] = act.skip;
                if ( evalSkip.apply(storyData) ) {
// =======================> skip step, for SSE
sseActs.push('skipped');      // The original step status is 'ready' in SHMUI side
// ===============================================================================
                    // ----------------- honsole ------------------------------
                    ( config.consoleOutput === 'step' && config.outputSkipInfo )
                    && cnsl.showSkip(act, 'step');
                    // --------------------------------------------------------

                } else {
                    // ---------------- record -------------------------------
                    record.startStep(suite, act, "given", _givenLoopCount);
                    // -------------------------------------------------------
/*
        // ---------- Listen console event of the page to record errors ----------2020-08-29
        if ( config.pageErrors ) {
            page.on('console', msg => {
                if ( `${msg.type()}` === 'error' ) {
                    console.log(msg.text());
                }
                // for (let i = 0; i < msg.args().length; ++i)
                // console.log(`${i}: ${msg.args()[i]}`);
            });
        }
        // -----------------------------------------------------------------------
*/
                    // call step runner by passing env to it. // 2020-08-15, added browser to step running context
                    // THe _result return just contains step title, status, error ..., xhr (if existed) is passed by 'page'
                    const _result = await stepRunr( act, storyData, browser, page, config );
                    if (config.screenshot ) {
                        const timestamp = Date.now();
                        const screenName = `${suite.story.split('.')[0]}_${timestamp}.png`;
                        try{
                            await page.screenshot({ path: path.join(config._rootPath, config.reportPath, `${screenName}`), fullPage: true });
                        } catch (e) { /* Sometimes screenshot will fail, just give up */ }
                        _result["screen"] = screenName;
                    }

                    if (config.cookies) {
                        const currentCookies = await page.cookies();
                        _result["cookies"] = currentCookies;
                    }

                    if (page.xhr) {
                        _result["xhr"] = {
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

                    // Save errors for this step to result.
                    if ( page.cnslErrors && page.cnslErrors.length > 0 ) {
                        _result["cnslErrors"] = [ ...page.cnslErrors ];
                        page.cnslErrors = [];
                    } else {
                        _result["cnslErrors"] = null;
                    }

                    
                    // Any step failure maked as this story loop failed
                    if ( !_result.status ) {
                        storyLoopStatus = false;
                    }

// =======================> step status, for SSE
sseActs.push( `${_result.status ? 'passed' : 'failed'}` );      // The original step status is 'ready' in SHMUI side
// ===============================================================================

                    // --------------------- record ---------------
                    record.endStep( _result, suite, act, "given", _givenLoopCount );
                    // --------------------------------------------
                }
            }

            // ------------> Start Given facts --------------------
            for (const fact of suite.given.facts ) {
                storyData["skip"] = fact.skip;
                if ( evalSkip.apply( storyData ) ) {
// =======================> skip step, for SSE
sseFacts.push('skipped');      // The original step status is 'ready' in SHMUI side
// ===============================================================================
                    // ----------------- honsole ------------------------------
                    ( config.consoleOutput === 'step' && config.outputSkipInfo )
                    && cnsl.showSkip(fact, 'step');
                    // --------------------------------------------------------

                } else {
                    // --------------------- record -------------
                    record.startStep(suite, fact, 'given', _givenLoopCount);
                    // ------------------------------------------

                    // call step runner by passing env to it.// 2020-08-15, added browser to step running context
                    const _result = await stepRunr( fact, storyData, browser, page, config );
                    // Any step failure maked as this story loop failed
                    if ( !_result.status ) {
                        storyLoopStatus = false;
                    }
// =======================> step status, for SSE
sseFacts.push( `${_result.status ? 'passed' : 'failed'}` );      // The original step status is 'ready' in SHMUI side
// ===============================================================================
                    // --------------------- record ---------------
                    record.endStep( _result, suite, fact, 'given', _givenLoopCount );
                    // --------------------------------------------
                }
            }

// =========> Insert SSE message for the given scenarion testing result.
if ( `${process.env["LOCAL_RUN"]}` != 'true' && `${process.env["HDW_BREAK"]}` != 'true' ) {
    eventBus.emit("SSE_HANDOW_STREAM", {
        stageIdx: suite["stageIdx"],
        story: suite.story,
        givenLP: _givenLoopCount,
        whenIdx: null,      // whenIdx=== null when current data is "given-scenario"
        whenLP: null,       // looping for a specific when scenario
        steps: {
            // string status array, could be "ready|passed|failed", e.g. ["passed", "passed", "failed"]. keep "ready" means skipped. 
            acts: sseActs,
            facts: sseFacts
        }
    });
}
// <=========================================================================
            // --------------> Start all Whens
            if (!suite.whens) { suite.whens = [] };     // For stories only with one Given scenario

            // Here the phaseData includes all gloabal params, params in current Given loop (story scoped) and data in this scenario of current loop 
            for ( let k = 0; k < suite.whens.length; k++ ) {
                const phase = suite.whens[k];

                // let storyData = { ...storyData };

                storyData["skip"] = phase.skip;
                if ( evalSkip.apply(storyData) ) {

// ===========> steps status, for SSE
const sseActs = null;   // null means the when phase is skipped
const sseFacts = null;
// <===================================================================
                    // ----------------- honsole ------------------------------
                    ( config.consoleOutput === 'step' && config.outputSkipInfo )
                    && cnsl.showSkip(phase, 'phase');
                    // --------------------------------------------------------

                    // --------------------- record -------------
                    record.skipPhase( suite, k, _givenLoopCount );
                    // ------------------------------------------

                } else {
                    let _whenLoopCount = 0;
                    const _whenLoops = phase.parameters.length;
                    const _stepCount = phase.acts.length + phase.facts.length;

                    // ------ honsole -------------
                    cnsl.wrapBlock( "when", _stepCount, _whenLoops );
                    // ---------------------

                    for ( let j = 0; j < phase.parameters.length; j++ ) {
// ===========> steps status, for SSE
const sseActs = [];
const sseFacts = [];
// <===================================================================

                        const params = phase.parameters[j];

                        // Create params data in current phase
                        let phaseData = deepExtend( { ...storyData }, params );

                        for ( let i = 0; i < phase.acts.length; i++ ) {
                            const act = phase.acts[i];
                            // Clear xhr record existed in page
                            page.xhr = null;

                            phaseData["skip"] = act.skip;
                            if ( evalSkip.apply( phaseData ) ) {
// =======================> skip step, for SSE
sseActs.push('skipped');      // The original step status is 'ready' in SHMUI side
// ===============================================================================
                                // ----------------- honsole ------------------------------
                                ( config.consoleOutput === 'step' && config.outputSkipInfo )
                                && cnsl.showSkip(act, 'step');
                                // --------------------------------------------------------
                            } else {
                                // --------------------- record -------------
                                record.startStep( suite, act, 'when', _givenLoopCount, k, _whenLoopCount );
                                // ------------------------------------------
/*
        // ---------- Listen console event of the page to record errors ----------2020-08-29
        if ( config.pageErrors ) {
            console.log("---------- listen consol output");
            page.on('console', msg => {
                if ( `${msg.type()}` === 'error' ) {
                    console.log(msg.text());
                }
                // for (let i = 0; i < msg.args().length; ++i)
                // console.log(`${i}: ${msg.args()[i]}`);
            });
        }
        // -----------------------------------------------------------------------
*/
                                // call step runner by passing env to it. // 2020-08-15, added browser to step running context
                                const _result = await stepRunr( act, phaseData, browser, page, config );

                                // XHR resolving and responsing time after an action step
                                await page.waitForTimeout( config.reactTime );
                                if (config.actResolveXHR) {
                                    await page.pendingXHR.waitForAllXhrFinished();
                                }
                                

                                if (config.screenshot) {
                                    const timestamp = Date.now();
                                    const screenName = `${suite.story.split('.')[0]}_${timestamp}.png`;
                                    try {
                                        await page.screenshot({ path: path.join(config._rootPath, config.reportPath, `${screenName}`), fullPage: true });
                                    } catch (e) { /* */ }
                                    
                                    _result["screen"] = screenName;
                                } 
                                /* 2020-08-14, try to get screenshot took in steps, actually this should be in Then step - show newTab screen
                                else if (page.newWindowScreen) {
                                    const timestamp = Date.now();
                                    const screenName = `${suite.story.split('.')[0]}_${timestamp}.png`;
                                    fs.renameSync(path.join(config._rootPath, config.reportPath, "newWindowScreen.png"), path.join(config._rootPath, config.reportPath, `${screenName}`))
                                    _result["screen"] = screenName;
                                    page['newWindowScreen'] = false;
                                }
                                */
                                
                                if (config.cookies) {
                                    const currentCookies = await page.cookies();
                                    _result["cookies"] = currentCookies;
                                }

                                if (page.xhr) {
                                    _result["xhr"] = {
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

                                // Save errors for this step to result.
                                if ( page.cnslErrors && page.cnslErrors.length > 0 ) {
                                    _result["cnslErrors"] = [ ...page.cnslErrors ];
                                    page.cnslErrors = [];   // clear errors
                                } else {
                                    _result["cnslErrors"] = null;
                                }

                                // Any step failure maked as this story loop failed
                                if ( !_result.status ) {
                                    storyLoopStatus = false;
                                }

// =======================> step status, for SSE
sseActs.push( `${_result.status ? 'passed' : 'failed'}` );      // The original step status is 'ready' in SHMUI side
// ===============================================================================
                                // --------------------- record ---------------
                                record.endStep( _result, suite, act, 'when', _givenLoopCount, k, _whenLoopCount );
                                // --------------------------------------------
                            }
                        }
                        for (const fact of phase.facts ) {
                            phaseData["skip"] = fact.skip;
                            if ( evalSkip.apply( phaseData ) ) {
// =======================> skip step, for SSE
sseFacts.push('skipped');      // The original step status is 'ready' in SHMUI side
// ===============================================================================
                                // ----------------- honsole ------------------------------
                                ( config.consoleOutput === 'step' && config.outputSkipInfo )
                                && cnsl.showSkip(fact, 'step');
                                // --------------------------------------------------------
                            } else {
                                // --------------------- record -------------
                                record.startStep( suite, fact, 'when', _givenLoopCount, k, _whenLoopCount );
                                // ------------------------------------------

                                // call step runner by passing env to it. // 2020-08-15, added browser to step running context
                                const _result = await stepRunr( fact, phaseData, browser, page, config );

                                // Any step failure maked as this story loop failed
                                if ( !_result.status ) {
                                    storyLoopStatus = false;
                                }
// =======================> step status, for SSE
sseFacts.push( `${_result.status ? 'passed' : 'failed'}` );      // The original step status is 'ready' in SHMUI side
// ===============================================================================
                                // --------------------- record ---------------
                                record.endStep( _result, suite, fact, 'when', _givenLoopCount, k, _whenLoopCount );
                                // --------------------------------------------
                            }
                        }

// ------> Insert SSE message for the given scenarion testing result.
if (`${process.env["LOCAL_RUN"]}` != 'true' && `${process.env["HDW_BREAK"]}` != 'true' ) {
    eventBus.emit("SSE_HANDOW_STREAM", {
        stageIdx: suite["stageIdx"],
        story: suite.story,
        givenLP: _givenLoopCount,
        whenIdx: k,      // 
        whenLP: _whenLoopCount,
        steps: {
            // string status array, could be "ready|passed|failed", e.g. ["passed", "passed", "failed"]. keep "ready" means skipped. 
            acts: sseActs,
            facts: sseFacts
        }
    });
} 
// ----------------------------------------------------------

                        _whenLoopCount = _whenLoopCount + 1;

                        // -------- honsole ---------
                        ( _whenLoopCount < _whenLoops ) && cnsl.wrapBlock("when");
                        // ---------------------------
                    }
                }
            }

            // --------------------- record ---------------
            record.setStoryLoopStaus(suite, _givenLoopCount, storyLoopStatus);
            // --------------------------------------------

            _givenLoopCount = _givenLoopCount + 1;

            // -------- honsole -----------
            ( _givenLoopCount < _givenLoops ) && cnsl.wrapBlock("given");
            // ------------------------------
        }
        // ---------------------- record --------------------
        record.endStory(suite);
        // --------------------------------------------------
    // ***************** After all **************
        /*
            Closed all opened pages before close browser, otherwise we will get "Error: EPERM: operation not permitted, unlink ..." exception sometimes.
            This error only happenes when we run handow with CLI locally
        */
        
        // If no planBrowser, stories launch their own browser session, so it is closed after story finished
        if (!planBrowser) {
            const openedPages = await browser.pages();
            await Promise.all(openedPages.map( (page) => page.close() ));
            await browser.close();
        } else {
            // const openedPages = await browser.pages();
            // await Promise.all(openedPages.map( (page) => page.close() ))

            await page.close();
        }
        
    // ******************************************
        eventBus.emit('SUITE_FINISHED', suite );
};

