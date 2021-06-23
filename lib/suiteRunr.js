/* eslint-disable no-invalid-this */
/* eslint-disable no-eval */
'use strict';

/**
 * Story runner
 * @module suiteRunr Run a story object
 * @description Module with single function as default export, which will run a story - suite. Along with story running, story sunner will write record and output to console.
 */
const deepExtend = require('deep-extend');
// const path = require('path');

const stepRunr = require('./stepRunr');
const cnsl = require('./honsole');
const eventBus = require('./eventBus');
const record = require('./record');
// const glob = require('glob');
const contextManager = require('./contextManager.js');
const pageManager = require('./pageManager.js');
const config = require('./planConfig').get();
const oops = require('./unexpect.js');

/*
    Condition evaluator for break or skip.
    Apply current story data (with skip expression) on this function to resolve the skip logic
 */
function evalSkip () {
    if ( `${process.env.HDW_BREAK}` === 'true' ) {
        return true;    // "HDW_BREAK" will skip all phases and steps
    } else {
        return eval(this.skip);
    }
}

/**
 * @exports storyRunr default export function as story runner
 * @param {object} suite Story object created by parsing the story file.
 * @param {object} stageParams The k-v pair object for active parameters of current stage, will inject into story and scenario data pool
 * @return {Promise} Records are updated and output to console along with story running, but no data is returned.
 */
module.exports = async (suite, stageParams) => {

    /*
        Inherit the plan scoped browser or create story dedicated incognito browser instance and open a page for current story
    */
    // const browser = planBrowser ? planBrowser : await launchBrowser({ headless: config.headless });
    // const page = await pageManager.open(browser);
    let context;
    if (`${config.browserSessionScope}` === "story") {
        context = await contextManager.newContext();
    } else {
        context = await contextManager.context();
    }
    const page = await pageManager.open(context);
    // console.log(`-------------------------open page (${page}) for story - ${suite.story}`);
    
    /*
        Optionally set listener for console error/warning message, e.g. code exceptions, http failures ...
        The error/warning messages are added to current page object, then they are written to record data
    */
    if ( config.pageErrors ) {
        page["cnslErrors"] = []; 
        page.on('console', msg => {
            if ( `${msg.type()}` === 'error' || `${msg.type()}` === 'warning' ) {   // For some reasons, some errors on Chrome are "warning" type in pptr
                page["cnslErrors"].push(`${msg.text()}`);
            }
        });
    }

    /*
        Init the Given-Loop (story looping)
    */
    let _givenLoopCount = 0;
    const _givenLoops = suite.given.parameters.length;

    /* --------------- Record ------------- */
    record.startStory(suite);       // Set record service ready for save test result for this story

    /* ---------- honsole output ---------- */
    cnsl.wrapBlock( "given", `${suite.story}`, _givenLoops );
    try {
        /*
            Loop story by parameters of the Given scenario
        */
        for ( let l = 0; l < suite.given.parameters.length; l++ ) {
            const sseActs = [];     // set act steps status list container for SSE data
            const sseFacts = [];    // set fact steps status list container for SSE data
            let storyLoopStatus = true;     // Preset current story looping status is true (success)

            /*
                Update storyData by merging stageParams with current Given-loop-params, the storyData is available for whole current story looping
            */
            const storyData = deepExtend( { ...stageParams }, suite.given.parameters[l] );

            /*
                Loop running all act steps in the Given scenario
            */
            // =============================> Start looping Given act steps
            for ( const act of suite.given.acts ) {
                
                page.xhr = null;                // Clear xhr record existed in page
                storyData["skip"] = act.skip;   // Add @skip expression as a field of current story data, they are evaluated for skip control.

                if ( evalSkip.apply(storyData) ) {
                    /*
                        skip current story on 2 conditions:
                        1, process.env.HDW_BREAK === true
                        2, Evaluate skip condition expression (if exist) on current story data to be true
                    */
                    
                    /* ---------- SSE status ----------- */
                    sseActs.push('skipped');      // The original step status is 'ready' in SHMUI side
                    
                    /* ---------- honsole output ---------- */
                    ( config.consoleOutput === 'step' && config.outputSkipInfo ) && cnsl.showSkip(act, 'step');

                } else {
                    /* --------------- Record ------------- */
                    record.startStep(suite, act, "given", _givenLoopCount);         // Record service ready for step testing result

                    /*
                        Run act with step runner, the _result return contains step title, status, error, ...
                        Some testing data are added to current page instead of the _result, e.g. xhr, console errors ...
                    */
                    const _result = await stepRunr( act, storyData, page, config );

                    /*
                        Wait for all XHR resolved if this feature is configured
                    */
                    if (config.actResolveXHR) {
                        await page.waitPendingXHR();
                    }
                    
                    /*
                        Continue populating the result data according config and what exist in page
                    */
                    if (config.screenshot ) {                                   // Make screenshot and set the image file name to result
                        _result["screen"] = await pageManager.screenshot(page, `${suite.story.split('.')[0]}`);
                    }
                    if ( config.cookies ) {                                     // Set cookies record to result
                        _result["cookies"] = await pageManager.cookies(page);
                    }
                    if (page.xhr) {                                             // Set xhr record to result
                        _result['xhr'] = pageManager.xhrRecord(page);
                    }
                    if ( page.cnslErrors && page.cnslErrors.length > 0 ) {      // Set console errors record result
                        _result["cnslErrors"] = [ ...page.cnslErrors ];
                        page.cnslErrors = [];
                    } else {
                        _result["cnslErrors"] = null;
                    }
                    
                    /*
                        Current story looping is failed if any step failed
                    */
                    if ( !_result.status ) {
                        storyLoopStatus = false;
                    }

                    /* ---------- SSE status ----------- */
                    sseActs.push( `${_result.status ? 'passed' : 'failed'}` );      // The original step status is 'ready' in SHMUI side


                    /* --------------- Record ------------- */
                    record.endStep( _result, suite, act, "given", _givenLoopCount );    // Record service save the testing result of this step

                }
            }
            // <=============================== Given act steps looping finished

            /*
                Loop running all fact steps in the Given scenario
            */
            // ==============================> Start looping Given fact steps
            for ( const fact of suite.given.facts ) {

                storyData["skip"] = fact.skip;   // Add @skip expression as a field of current story data, they are evaluated for skip control.

                if ( evalSkip.apply( storyData ) ) {
                    sseFacts.push('skipped');      // The original step status is 'ready' in SHMUI side
                    ( config.consoleOutput === 'step' && config.outputSkipInfo )  && cnsl.showSkip(fact, 'step');

                } else {
                    /* --------------- Record ------------- */
                    record.startStep(suite, fact, 'given', _givenLoopCount);

                    /*
                        Run fact with step runner
                    */
                    const _result = await stepRunr( fact, storyData, page, config );
                    if ( !_result.status ) {
                        storyLoopStatus = false;
                    }
                    sseFacts.push( `${_result.status ? 'passed' : 'failed'}` );
                    record.endStep( _result, suite, fact, 'given', _givenLoopCount );
                }
            }
            // <============================ Given fact steps looping finished


            /*
                Emit event to indicate SHM SSE engine uploading testing result of current finished scenario
            */
            if ( `${process.env["LOCAL_RUN"]}` !== 'true' && `${process.env["HDW_BREAK"]}` !== 'true' ) {
                eventBus.emit("SSE_HANDOW_STREAM", {
                    stageIdx: suite["stageIdx"],
                    story: suite.story,
                    givenLP: _givenLoopCount,
                    whenIdx: null,      // whenIdx=== null when current data is "given-scenario"
                    whenLP: null,       // looping for a specific when scenario
                    steps: {
                        /* string status array, could be "ready|passed|failed", e.g. ["passed", "passed", "failed"]. keep "ready" means skipped. */ 
                        acts: sseActs,
                        facts: sseFacts
                    }
                });
            }

            /*
                Run all the 'when' scenarios (when-phases) - including loop the scenario by its parameters 
            */
            if (!suite.whens) {
                suite.whens = [];       // Set whens empty if the story has only one Given scenario
            }
            for ( let k = 0; k < suite.whens.length; k++ ) {
                
                const phase = suite.whens[k];       // Current when-phase (scenario)

                storyData["skip"] = phase.skip;
                if ( evalSkip.apply(storyData) ) {
                    ( config.consoleOutput === 'step' && config.outputSkipInfo ) && cnsl.showSkip(phase, 'phase');
                    record.skipPhase( suite, k, _givenLoopCount );

                } else {
                    let _whenLoopCount = 0;
                    const _whenLoops = phase.parameters.length;
                    const _stepCount = phase.acts.length + phase.facts.length;

                    /* ---------- honsole output ---------- */
                    cnsl.wrapBlock( "when", _stepCount, _whenLoops );

                    /*
                        Iterate a When-phase by its parameter array
                    */
                    for ( let j = 0; j < phase.parameters.length; j++ ) {
                        const sseActs = [];
                        const sseFacts = [];

                        /*
                            Merge the story data of current When-phase-loop parameters 
                        */
                        const phaseData = deepExtend( { ...storyData }, phase.parameters[j] );

                        /*
                            Loop running all act steps in the When-phase-loop, the acts are same but phaseData is different for each loop
                        */
                        // ============================> Start looping act steps of a When-Loop
                        for ( const act of phase.acts ) {
                            page.xhr = null;

                            phaseData["skip"] = act.skip;
                            if ( evalSkip.apply( phaseData ) ) {
                                sseActs.push('skipped');      // The original step status is 'ready' in SHMUI side
                                ( config.consoleOutput === 'step' && config.outputSkipInfo ) && cnsl.showSkip(act, 'step');

                            } else {
                                //* --------------- Record ------------- */
                                record.startStep( suite, act, 'when', _givenLoopCount, k, _whenLoopCount );

                                /*
                                    Run act with step runner, the _result return contains step title, status, error, ...
                                    Some testing data are added to current page instead of the _result, e.g. xhr, console errors ...
                                */
                                const _result = await stepRunr( act, phaseData, page, config );

                                /*
                                    Wait for all XHR resolved if this feature is configured
                                */
                                if (config.actResolveXHR) {
                                    await page.waitPendingXHR();
                                }

                                /*
                                    Continue populating the result data according config and what exist in page
                                */
                                if (config.screenshot ) {
                                    _result["screen"] = await pageManager.screenshot(page, `${suite.story.split('.')[0]}`);
                                }
                                if ( config.cookies ) {
                                    _result["cookies"] = await pageManager.cookies(page);
                                }
                                if (page.xhr) {
                                    _result['xhr'] = pageManager.xhrRecord(page);
                                }
                                if ( page.cnslErrors && page.cnslErrors.length > 0 ) {
                                    _result["cnslErrors"] = [ ...page.cnslErrors ];
                                    page.cnslErrors = [];   // clear errors
                                } else {
                                    _result["cnslErrors"] = null;
                                }

                                /*
                                    Current story looping is failed if any step included is failed
                                */
                                if ( !_result.status ) {
                                    storyLoopStatus = false;
                                }

                                /* ---------- SSE status ----------- */
                                sseActs.push( `${_result.status ? 'passed' : 'failed'}` );      // The original step status is 'ready' in SHMUI side

                                /* --------------- Record ------------- */
                                record.endStep( _result, suite, act, 'when', _givenLoopCount, k, _whenLoopCount );

                            }
                        }
                        // <=========================== The act steps of a When-Loop finished

                        /*
                            Loop running all fact steps in the When-phase-loop, the facts are same but phaseData is different for each loop
                        */
                        // ============================> Start looping fact steps of a When-Loop
                        for (const fact of phase.facts ) {
                            phaseData["skip"] = fact.skip;
                            if ( evalSkip.apply( phaseData ) ) {
                                sseFacts.push('skipped');      // The original step status is 'ready' in SHMUI side
                                ( config.consoleOutput === 'step' && config.outputSkipInfo ) && cnsl.showSkip(fact, 'step');

                            } else {
                                record.startStep( suite, fact, 'when', _givenLoopCount, k, _whenLoopCount );

                                const _result = await stepRunr( fact, phaseData, page, config );

                                if ( !_result.status ) {
                                    storyLoopStatus = false;
                                }
                                
                                /* ---------- SSE status ----------- */
                                sseFacts.push( `${_result.status ? 'passed' : 'failed'}` );      // The original step status is 'ready' in SHMUI side
                                
                                /* --------------- Record ------------- */
                                record.endStep( _result, suite, fact, 'when', _givenLoopCount, k, _whenLoopCount );

                            }
                        }
                        // <=========================== The fact steps of a When-Loop finished

                        /*
                            Emit event to indicate SHM SSE engine uploading testing result of current finished scenario
                        */
                        if (`${process.env["LOCAL_RUN"]}` !== 'true' && `${process.env["HDW_BREAK"]}` !== 'true' ) {
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


                        _whenLoopCount = _whenLoopCount + 1;    // Increase the when-looping counter

                        /* ---------- honsole output ---------- */
                        ( _whenLoopCount < _whenLoops ) && cnsl.wrapBlock("when");

                    }
                }
            }

            /* --------------- Record ------------- */
            record.setStoryLoopStaus(suite, _givenLoopCount, storyLoopStatus);      // Save record of current story looping


            _givenLoopCount = _givenLoopCount + 1;      // Increase the given-looping counter (story loooping)
            /* ---------- honsole output ---------- */
            ( _givenLoopCount < _givenLoops ) && cnsl.wrapBlock("given");

        }
    } catch (err) {
        await oops(`Unexpected error in running - ${err}`);
    }

    /*
        Whole story finished - After all
    */
    /* --------------- Record ------------- */
    record.endStory(suite);

    /*
        Close the story scoped context, or just close the page for this story if the browser context is plan scoped
    */
    if (`${config.browserSessionScope}` === "story") {
        await contextManager.closeContext(context);
    } else {
        await pageManager.close(page);
    } 
    
    /*
        Emit event 'SUITE_FINISHED' to indicate plan runner schedule next story or stage
    */
    eventBus.emit('SUITE_FINISHED', suite );
};

