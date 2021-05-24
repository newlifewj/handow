'use strict';

/**
 * @module storyRunr Run a story object
 */
const appRoot = require("app-root-path");
const deepExtend = require('deep-extend');
const path = require('path');
const util = require('util');
const fs = require('fs');
const glob = require('glob');
// const fsExtra = require('fs-extra');

const parseStory = require('./parseStory');
// Import suiteRunr after rebuild steps, otherwise the stepRunr in suiteRunr will refer old step bundles
// const suiteRunr = require('./suiteRunr');
let suiteRunr = null;
const eventBus = require('./eventBus');
const record = require('./record');
const harchive = require('./harchive');
const planConfig = require('./planConfig');
const getGlobalParams = require('./globalParams');
const launchBrowser = require('./launchBrowser.js');
let config;

const sleep = util.promisify(setTimeout);
const unlinkPromise = util.promisify(fs.unlink);
const cnsl = require('./honsole');

let planBrowser;

let workers;
let stageIdx;
let waitingSuites = [];
let totalStageSuites = 0;

let storyStatus;    // the story indicators for honsole output.

let gParams = {};   // Parameters from global parameter files.
let stageParams;

let plan;
let planTree;

const runStage = async ( stage ) => {
    // Parse the feature stories before put to run
    const suites = [];
    storyStatus = [];

    if ( stage.newBrowserSession && planBrowser ) {
        try {
            // Close current browser and launch a new instance, so that all the cookies ... are cleared
            await planBrowser.close();
            sleep(1000);
            planBrowser = await launchBrowser({ headless: config.headlessChromium });

        } catch (err) {
            // There are issues when renew the Chrome browser, it is okay for headless Chromium
            /*
            // Handle exception when renew the plan browser
            if ( planBrowser ) {
                const openedPages = await planBrowser.pages();
                if (openedPages.length === 0) {
                    planBrowser = await launchBrowser({ headless: config.headlessChromium });
                }
            } else {
                planBrowser = await launchBrowser({ headless: config.headlessChromium });
            }
            */

        }
        
    }

    // ------------ 2021-05-22 ---------------> Add stage parameters
    stageParams = deepExtend({}, gParams);
    deepExtend( stageParams, stage.params ? stage.params : {});
    // <---------------------------------------

    // Remove duplicated stories in one stage
    const storySet = new Set(stage.stories);
    stage.stories = [...storySet];

    for ( let suiteName of stage.stories ) {
        suiteName = suiteName.endsWith('.feature') ? suiteName : `${suiteName}.feature`;
        // parse a story to suite object and put it to running group
        const _suite = parseStory( path.join(config._rootPath, config.storiesPath, suiteName) );
        _suite["stageIdx"] = stageIdx;
        suites.push(_suite);
        storyStatus.push({
            story: suiteName,
            status: "pending"
        });
    }
    stageIdx = stageIdx + 1;

    totalStageSuites = suites.length;
    waitingSuites = [];

    // ------------------ record -------------------------
    // Init stage in recor object
    record.startStage(stage);
    // --------------------------------------------------

    if ( suites.length > workers ) {
        for ( let i = 0; i < workers; i++ ) {
            // Run stories within workers number in parallel at first.
            suiteRunr(suites[i], stageParams, planBrowser);
            storyStatus[i]['status'] = "run";
            // THINKING: really need sleep a while?
            sleep(300);
        }
        // Additional suite are waiting suite finished event and put one to run
        waitingSuites = suites.slice(workers);
    } else {
        for ( let i = 0; i < suites.length; i++ ) {
            // Run all stories in the meantime if suites number less than workers
            suiteRunr(suites[i], stageParams, planBrowser);
            storyStatus[i]['status'] = "run";
            // THINKING: really need sleep a while?
            sleep(300);
        }
    }
    // ------------------- honsole story status output --------------
    cnsl.runSuites(storyStatus);
    cnsl.setProgress(0.01);
    // --------------------------------------------------------------
};

/**
 * @module planRunr
 *
 * 1, Run stages in a plan sequentially with event control
 * 2, Run suites in a stage with multi-workers.
 * 3, Workers run a group suites in parallel according to how many workers are implemented.
 * 4, Once a suite is finished, a suite in waiting list is put to run until no suite is waiting.
 * 5, When all suites in a stage are finished, runner start run a new stage.
 * 6, When all suites in the last stage are finished, the plan is finished.
 */

/**
 * @param {}
 */
const run = async ( _plan, _pTree, wkrs ) => {      // 0407, pass planTree to planRunr
    
    let newArcRecord = null;
    planTree = _pTree;

// =========> SSE start running ===========================
    if ( `${process.env["LOCAL_RUN"]}` !== 'true' ) {
        eventBus.emit("SSE_HANDOW_STREAM", {
            status: "start",
            plan: _plan.title
        });
    }
// <=======================================================

    // TODO: verify the plan object, break out and output warning info for bad plan file.

    plan = _plan;
    config = deepExtend( planConfig.get(), plan.config );
    

    // For SHM running, implement the SHM mandatory configs, e.g. no-console-output ...
    if (`${process.env["LOCAL_RUN"]}` !== 'true' ) {
        try {
            require.resolve(path.join(`${appRoot}`, 'shmSetting.json'));
            const _shmSetting = fs.readFileSync(path.join(`${appRoot}`, 'shmSetting.json'));
            const _shmHdwConfig = JSON.parse(_shmSetting)['hdwConfig'];

            // shm consoleOutput==false means inherit the default configuration
            if (!_shmHdwConfig.consoleOutput) {
                delete _shmHdwConfig.consoleOutput;
            }
           
            // For SHM running, shmConfig will override the default config
            deepExtend( config, _shmHdwConfig );
            // console.log('\nInfo@honsole - SHM call handow running ...\n');
        } catch (err) {
            //
        }
    }

    planConfig.set(config);

    stageIdx = 0;
    workers = config.workers;

    if ( planConfig.get().globalParams ) {
        gParams = await getGlobalParams( path.join( config._rootPath, config.globalParams ) );
    }


// TODO: clean it after using npm package
// -------------- Should move to pipeline to run buildSteps.
    // Rebuild steps before each plan running becuase they could be updated.
    // const stepsBuiltInfo = await buildSteps( path.join(config._rootPath, config.stepsPath) );

    // Import suiteRunr after rebuild steps to make sure new step bundles refered by stepRunr
    suiteRunr = require('./suiteRunr');

    // THINKING: It is total available steps, current plan only implement a sub set of it. Don't show it.
    // Add info to plan specify how many steps are refered for this plan-running
    // plan["withSteps"] = stepsBuiltInfo;
// -------------
    

    // ---------------------- honsole -------------------
    if ( config.consoleOutput !== "none" ) {
        cnsl.clear();
        cnsl.startWarning();
    }
    // --------------------------------------------------

    // ---------------------- record --------------------
    // Initial record object for current plan running (steps are re-built already)
    record.init(plan);
    // --------------------------------------------------

    // Handle history archive
    if ( config.autoArchive ) {
        newArcRecord = harchive();
    }

    // clean current record and screenshots
    const storyFiles = glob.sync( path.join(config._rootPath, config.reportPath, '*.*') );
    // Process each custom steps file and merge with built-in steps
    for ( const file of storyFiles ) {
        await unlinkPromise(file);
    }
/* 0407 No .tree file in project any more
    // copy the plan tree json file to record as .tree file, which is used by SHM report render
    try {
        if (plan.path.endsWith('.plan.json')) {
            fs.copyFileSync( plan.path.replace(".plan.json", ".tree.json"), path.join(config._rootPath, config.reportPath, 'plan.tree') );
        } else if (plan.path.endsWith('.feature')) {
            fs.copyFileSync( plan.path.replace(".feature", ".tree.json"), path.join(config._rootPath, config.reportPath, 'plan.tree') );
        }
    } catch (e) {
        //
    }
*/
    // Browser will be launched for each story when config.browserSessionScope === 'story'
    if (`${planConfig.get()['browserSessionScope'].toLowerCase()}` !== 'story') {
        planBrowser = await launchBrowser({ headless: config.headlessChromium });
    } else {
        planBrowser = null;
    }

    // Start run the first stage (stageIdx == 0)
    runStage( plan.stages[stageIdx] );

    return newArcRecord;    // return new generated archive path, e.g. "foo.plan_158619554342"
};

module.exports = run;
/*
module.exports = {
    run: run
};
*/

/**
 * EventBus listen to 2 events: "SUITE_FINISHED" and "STAGE_FINISHED".
 * On "SUITE_FINISHED":
 * 1, runner will put a new suite to run if waitingSuites is not empty.
 * 2, just wait for all suites in current stage finished (totalStageSuites is the counter for this)
 * 3, or emit "STAGE_FINISHED" if all suites in current stage finished.
 * on "STAGE_FINISHED":
 * 1, start run next stage if current stage is not the last one
 * 2, or emit "HDW_TEST_FINISHED" if last stage finished.
 * 
 * !!!!!!! Don not put event listener into function call, multi-listener will be bound. (except you prefer this) !!!!!!!!
 */

eventBus.on('SUITE_FINISHED', async ( _suite ) => {
    await sleep(300);   // A little bit time for suite reports process, maybe not necessary

    // SHM stop request will set "process.env.HDW_BREAK = true", this will terminate running.
    // It also skips all on-going steps and scenarios to speed stopping.
    if ( `${process.env.HDW_BREAK}` === 'true') {
        plan.stages = [];           // For clear the stages to prevent run further stories
    }

    // ------------------- honsole story status output --------------
    storyStatus.map( (ss) => {
        if ( ss.story === _suite.story ) {
            ss.status = _suite.status ? _suite.status : "failed";
        }
    } );
    // --------------------------------------------------------------

    totalStageSuites = totalStageSuites - 1;

        if ( totalStageSuites > 0 ) {
            if ( waitingSuites.length > 0 ) {
                const addingSuite = waitingSuites.pop();
                suiteRunr( addingSuite, stageParams, planBrowser );

                // ------------------- honsole story status output --------------
                storyStatus.map( (ss) => {
                    if ( ss.story === addingSuite.story ) {
                        ss.status = "run";
                    }
                } );
                cnsl.updateSuitesInfo(storyStatus);
                // --------------------------------------------------------------

            } else {
                // ------------------- honsole story status output --------------
                cnsl.updateSuitesInfo(storyStatus);
                // --------------------------------------------------------------
                // no suite in current stage in wait-queue, just wait finishing current stage.
            }
        } else if ( stageIdx < plan.stages.length ) {
            // console.log("One stage finished");
            eventBus.emit('STAGE_FINISHED');        // No listener now
            // ------------------- honsole story status output --------------
            cnsl.updateSuitesInfo(storyStatus);
            cnsl.clearProgress();
            cnsl.setProgress(1);
            // --------------------------------------------------------------
            // Start a new stage if available
            runStage( plan.stages[stageIdx] );
        } else {
            
            if (planBrowser) {
                const openedPages = await planBrowser.pages();
                await Promise.all(openedPages.map( (page) => page.close() ));
                await planBrowser.close();
            }
            // ------------------- honsole story status output --------------
            cnsl.clearProgress();
            cnsl.setProgress(1);
            cnsl.updateSuitesInfo(storyStatus);
            // --------------------------------------------------------------

            if ( `${process.env["HDW_BREAK"]}` !== 'false' ) {
                // clean current record and screenshots, the latest record under reports/ will be clear after breaking
                const storyFiles = glob.sync( path.join(config._rootPath, config.reportPath, '*.*') );
                for ( const file of storyFiles ) {
                    await unlinkPromise(file);
                }

                console.log(`\n-- Alert@planRunr -- <${plan.title}> is teminated by SHM stop command ...\n`);
                
            } else {
                // ----------- record saved as report ---------------------
                record.mkSummary();
                await record.save(planTree);    // Finally, the json result is generated, the latest record is ready for presenting.
                // ------------------- honsole story status output --------------
                
                if (`${process.env.NODE_ENV}` !== 'production') {
                    cnsl.showResult();
                }
                
            }

            // Indicate caller (_handow) test finished. The "test-end" status is process in same place.
            eventBus.emit('HDW_TEST_FINISHED');       
        }
});