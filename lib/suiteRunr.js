'use strict';

/**
 * @module storyRunr Run a story object
 */

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
    return eval(this.skip);
}

/**
 * Story runner
 *
 * @param {suite} - story object by parsing story file.
 * @param {params} - k-v pair object from global parameters, will inject into story sdata
 * @return {Promise} Report is updated along with story running, and output to console by specified.
 */
// TODO: Access the report object.
// TODO: Output to websocket endpoint ( in the future )
module.exports = async ( suite, params ) => {

// ***************** Before all **************
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

    const browser = await puppeteer.launch({
        args: [
            '--disable-setuid-sandbox',
            '--no-sandbox',
            // '--start-fullscreen',
            '--ignore-certificate-errors'     // So we can access https directly
        ],
        defaultViewport: null,
        ignoreHTTPSErrors: true,
        headless: config.headlessChromium     // true: use headless Chrome; false: invoke real Chrome;
    });


    // THINKING: the defaultBrowserContext is incognito or not?
    // const context = await browser.defaultBrowserContext();
    // Open a new context will show 2 windows, not necessary to open new IncognitoBrowserContext??
    // const context = await browser.createIncognitoBrowserContext();
    let context;
    if ( config.newIncognitoContext === true ) {
        context = await browser.createIncognitoBrowserContext();
    } else {
        context = await browser.defaultBrowserContext();
    }

    const pages = await context.pages();

    // THINKING: The new context of the new launched browser shouldn't have any pages open.
    if (pages.length > 0) {
        page = pages[0];
    } else {
        page = await context.newPage();
    }

    // page = await browser.newPage();  // Use page in default context.
    await page.setViewport( viewport );

    // Let page bring more to step running context 
    page["pendingXHR"] = new PendingXHR(page);
    page["axios"] = httpAgent;

    // All available parameters could be found in story data repository, including global stuffs
    let sdata = params ? { ...params, _anyOtherPros: null } : {};
// *********************************************

    let _givenLoopCount = 0;
    const _givenLoops = suite.given.parameters.length;

    // ---------------------- record --------------------
    record.startStory(suite);
    // --------------------------------------------------

    // ---- honsole ----
    cnsl.wrapBlock( "given", `${suite.story}`, _givenLoops );
    // --------------

    // Given looping - story level loop
    for ( let l = 0; l < suite.given.parameters.length; l++ ) {
        const params = suite.given.parameters[l];
        // update story data
        sdata = { ...sdata, ...params };
        sdata = deepExtend( sdata, params );

        let storyLoopStatus = true;
        for ( let i = 0; i < suite.given.acts.length; i++ ) {
            const act = suite.given.acts[i];

            // Clear xhr record existed in page
            page.xhr = null;

            // Add @skip expression as a field of current story data, then apply them to evaluate the condition.
            sdata["skip"] = act.skip;
            if ( evalSkip.apply(sdata) ) {
                // ----------------- honsole ------------------------------
                ( config.consoleOutput === 'step' && config.outputSkipInfo )
                && cnsl.showSkip(act, 'step');
                // --------------------------------------------------------
            } else {
                // ---------------- record -------------------------------
                record.startStep(suite, act, "given", _givenLoopCount);
                // -------------------------------------------------------

                // call step runner by passing env to it.
                const _result = await stepRunr( act, sdata, page, config );
                if (config.screenshot) {
                    const timestamp = Date.now();
                    const screenName = `${suite.story.split('.')[0]}_${timestamp}.png`;
                    await page.screenshot({ path: path.join(config._rootPath, config.reportPath, `${screenName}`), fullPage: true });
                    _result["screen"] = screenName;
                }

                if (config.cookies) {
                    const currentCookies = await page.cookies();
                    _result["cookies"] = currentCookies;
                }

                if (page.xhr) {
                    _result["xhr"] = page.xhr;
                }
                // Any step failure maked as this story loop failed
                if ( !_result.status ) {
                    storyLoopStatus = false;
                }

                // --------------------- record ---------------
                record.endStep( _result, suite, act, "given", _givenLoopCount );
                // --------------------------------------------
            }
        }
        for (const fact of suite.given.facts ) {
            sdata["skip"] = fact.skip;
            if ( evalSkip.apply( sdata ) ) {
                // ----------------- honsole ------------------------------
                ( config.consoleOutput === 'step' && config.outputSkipInfo )
                && cnsl.showSkip(fact, 'step');
                // --------------------------------------------------------
            } else {
                // --------------------- record -------------
                record.startStep(suite, fact, 'given', _givenLoopCount);
                // ------------------------------------------

                // call step runner by passing env to it.
                const _result = await stepRunr( fact, sdata, page, config );
                // Any step failure maked as this story loop failed
                if ( !_result.status ) {
                    storyLoopStatus = false;
                }

                // --------------------- record ---------------
                record.endStep( _result, suite, fact, 'given', _givenLoopCount );
                // --------------------------------------------
            }
        }
        for ( let k = 0; k < suite.whens.length; k++ ) {
            const phase = suite.whens[k];

            sdata["skip"] = phase.skip;
            if ( evalSkip.apply(sdata) ) {
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

                    const params = phase.parameters[j];
                    // update story data
                    // sdata = { ...sdata, ...params };
                    sdata = deepExtend( sdata, params );
                    for ( let i = 0; i < phase.acts.length; i++ ) {

                        const act = phase.acts[i];
                        // Clear xhr record existed in page
                        page.xhr = null;

                        sdata["skip"] = act.skip;
                        if ( evalSkip.apply( sdata) ) {
                            // ----------------- honsole ------------------------------
                            ( config.consoleOutput === 'step' && config.outputSkipInfo )
                            && cnsl.showSkip(act, 'step');
                            // --------------------------------------------------------
                        } else {

                            // --------------------- record -------------
                            record.startStep( suite, act, 'when', _givenLoopCount, k, _whenLoopCount );
                            // ------------------------------------------

                            // call step runner by passing env to it.
                            const _result = await stepRunr( act, sdata, page, config );

                            if (config.screenshot) {
                                const timestamp = Date.now();
                                const screenName = `${suite.story.split('.')[0]}_${timestamp}.png`;
                                await page.screenshot({ path: path.join(config._rootPath, config.reportPath, `${screenName}`), fullPage: true });
                                _result["screen"] = screenName;
                            }
                            
                            if (config.cookies) {
                                const currentCookies = await page.cookies();
                                _result["cookies"] = currentCookies;
                            }

                            if (page.xhr) {
                                _result["xhr"] = {
                                    data: page.xhr.data,
                                    status: page.xhr.status,
                                    headers: page.xhr.headers,
                                    request: {
                                        path: page.xhr.request.path,
                                        headers: page.xhreq.headers,
                                        method: page.xhreq.method,
                                        body: page.xhreq.data
                                    }
                                };
                            }
                            // Any step failure maked as this story loop failed
                            if ( !_result.status ) {
                                storyLoopStatus = false;
                            }

                            // --------------------- record ---------------
                            record.endStep( _result, suite, act, 'when', _givenLoopCount, k, _whenLoopCount );
                            // --------------------------------------------
                        }
                    }
                    for (const fact of phase.facts ) {

                        sdata["skip"] = fact.skip;
                        if ( evalSkip.apply( sdata ) ) {
                            // ----------------- honsole ------------------------------
                            ( config.consoleOutput === 'step' && config.outputSkipInfo )
                            && cnsl.showSkip(fact, 'step');
                            // --------------------------------------------------------
                        } else {
                            // --------------------- record -------------
                            record.startStep( suite, fact, 'when', _givenLoopCount, k, _whenLoopCount );
                            // ------------------------------------------

                            // call step runner by passing env to it.
                            const _result = await stepRunr( fact, sdata, page, config );

                            // Any step failure maked as this story loop failed
                            if ( !_result.status ) {
                                storyLoopStatus = false;
                            }

                            // --------------------- record ---------------
                            record.endStep( _result, suite, fact, 'when', _givenLoopCount, k, _whenLoopCount );
                            // --------------------------------------------
                        }
                    }

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
    await browser.close();
// ******************************************
    eventBus.emit('SUITE_FINISHED', suite );
};

