'use strict';

/**
 * Plan Runner
 * @module planRunr Run a plan object
 * @description Module with single function as default export, which will run a specified plan.
 * If latest report exists in current '/records' path, the plan runner will push it to archives, and then new reports are generated along plan running.
 */
const appRoot = require("app-root-path");
const deepExtend = require('deep-extend');
const path = require('path');
const util = require('util');
const fs = require('fs');
const glob = require('glob');
// const fsExtra = require('fs-extra');

const parseStory = require('./parseStory');
const eventBus = require('./eventBus');
const record = require('./record');
const harchive = require('./harchive');
const planConfig = require('./planConfig');
const getGlobalParams = require('./globalParams');
const contextManager = require('./contextManager.js');
const oops = require('./unexpect.js');

const sleep = util.promisify(setTimeout);
const unlinkPromise = util.promisify(fs.unlink);
const cnsl = require('./honsole');
const platform = process.platform.toLocaleLowerCase();

/* The suiteRunr must be reloaded after rebilding steps to avoid using the cached old step bundles, here require('./suiteRunr') is not working */
let suiteRunr = null;
let workers;                // The workers number doparallel running for all stages
let stageIdx;               // Dynamic index for stages sequential executing
let waitingSuites = [];     // Stories (suites) in a stage are grouped according to current workers number, the groups are pushed to waiting list
let totalStageSuites = 0;   // How many stories (suites) exists in current stage
let storyStatus;            // the story indicators for honsole output, it is an array matching with the suites array in a stage.
let gParams = {};           // Parameters from global parameter files.
let stageParams;            // parameters defined in current stage
let plan;                   // The plan load to the plan runner
let planTree;               // The generated plan-tree for the loaded plan
let config;

/**
 * @function runStage Run a stage in the plan 
 * @param {object} stage The stage object, it is an object property of the stages array in the plan object
 * @description The plan runner just call runStage sequentially to run all stages included
 */
const runStage = async (stage) => {

    /*
        User params in stage override current parameters, actually the stageParams is the 'global' parameters availble for stories of this stage
    */
    stageParams = deepExtend({}, gParams);
    deepExtend(stageParams, stage.params ? stage.params : {});

    /*
        Initial data structure for stage running
    */
    const suites = [];      // Story (suite) objects array in the stage
    storyStatus = [];       // Status array matching with current suites
    stage.stories = [...new Set(stage.stories)];    // Remove duplicated stories in one stage
    for (let suiteName of stage.stories) {
        suiteName = suiteName.endsWith('.feature') ? suiteName : `${suiteName}.feature`;
        /* parse a story to suite object and put it to running group */
        const _suite = parseStory(path.join(config._rootPath, config.storiesPath, suiteName));
        _suite["stageIdx"] = stageIdx;
        suites.push(_suite);
        storyStatus.push({
            story: suiteName,
            status: "pending"
        });
    }
    totalStageSuites = suites.length;

    /*
        If stories in the stage more than workers number, put the additional stories to waitingSuites list.
        Once a story running finished, the 'SUITE_FINISHED' event handler will pick one story in waiting list and put it to run.
    */
    if (suites.length > workers) {
        waitingSuites = suites.slice(workers);
    } else {
        waitingSuites = [];
    }

    /* After init stage running data, let index point to next stage */
    stageIdx = stageIdx + 1;

    /* --------------- Record ------------- */
    /* Init stage in recor object */
    record.startStage(stage);

    /*
        Renew browser on a stage
        When the browser is plan scope but its seesion need to be cleared on particuler stage, here it is closed and launched new instance again.
    */
    if (stage.newBrowserSession) {
        try {
            await contextManager.cleanContext();
        } catch (err) {
            await oops(`Exception on clean current browser context for a stage - ${err}`);
        }
    }

    /*
        Start stage running, after that the running flow is controlled by 'SUITE_FINISHED' event handler
    */
    for (let i = 0; i < workers; i++) {
        if (suites[i]) {
            suiteRunr(suites[i], stageParams);
            storyStatus[i]['status'] = "run";
            await sleep(300);     // THINKING: really need sleep a while?
        }
    }

    /* ---------- honsole story status output ---------- */
    cnsl.runSuites(storyStatus);
    cnsl.setProgress(0.01);
};

/**
 * @exports planRunr default export function as plan runner
 * @param {object} _plan The plan object
 * @param {object} _pTree The plan tree object built before call the plan runner
 * @returns {string} return the new archived record leaf-directory path
 * @description The plan runner call stage runner to run stages in the plan sequentially.
 * 1, Run stages in a plan sequentially with event control
 * 2, Run suites in a stage with multi-workers.
 * 3, Workers run a group suites in parallel according to how many workers are implemented.
 * 4, Once a suite is finished, a suite in waiting list is put to run until no suite is waiting.
 * 5, When all suites in a stage are finished, runner start run a new stage.
 * 6, When all suites in the last stage are finished, the plan is finished.
 */
module.exports = async (_plan, _pTree) => {

    /* Build the configuration for current plan running */
    config =  { ...planConfig.get('global') };
    deepExtend(config, _plan.config);   // Use config of the plan to override the inherited config properties
    
    if (`${process.env["LOCAL_RUN"]}` !== 'true') {    // For SHM running (not native run), put the config in "shmSetting.json" on current config 
        try {
            require.resolve(path.join(`${appRoot}`, 'shmSetting.json'));
            const _shmSetting = fs.readFileSync(path.join(`${appRoot}`, 'shmSetting.json'));
            const _shmHdwConfig = JSON.parse(_shmSetting)['hdwConfig'];
            deepExtend(config, _shmHdwConfig);    // For SHM running, shmConfig will override the default config
            config['localRender'] = false;          // Handow will not generate static html report if it is called by SHM
        } catch (err) {
            await oops(`Merge SHM setting error - ${err}`);
        }
    }
    planConfig.set(config);     // Update the config of the planConfig service, so that other modules can get updated data

    /* Init plan running data structure */
    plan = _plan;
    planTree = _pTree;
    stageIdx = 0;               // Plan always start runnig from the 1st stage
    workers = config.workers;
    suiteRunr = require('./suiteRunr');     // Re-import suiteRunr per plan loading to avoid suite runner cache old step bundles

    /* load global parameters from the param files */
    if (planConfig.get().globalParams) {
        gParams = await getGlobalParams(path.join(config._rootPath, config.globalParams));
    }

    /* ---------- SSE start running ----------- */
    if (`${process.env["LOCAL_RUN"]}` !== 'true') {
        eventBus.emit("SSE_HANDOW_STREAM", {
            status: "start",
            plan: _plan.title
        });
    }

    /* ---------- honsole start output ---------- */
    if (config.consoleOutput !== "none") {
        cnsl.clear();
        cnsl.startWarning();
    }

    /* --------- Record ------------ */
    record.init(plan);      // Initial record object for current plan running (steps are re-built already)
    const newArcRecord = config.autoArchive && harchive();      // Put current latest record to archive per config
    const _files = glob.sync(path.join(config._rootPath, config.reportPath, '*.*'));
    for (const file of _files) {
        await unlinkPromise(file);      // Remove all latest record files, ready for new records saving
    }


    /* Launch the browser with specified mode (headless or not) except Linux OS, browsers on Linux are forced to headless mode */
    await contextManager.launchBrowser({ headless: `${platform}` === "linux" ? true : config.headless });

    /* Start run the plan from the 1st stage */
    runStage(plan.stages[stageIdx]);

    return newArcRecord ? newArcRecord : null;    // return new generated archive path, e.g. "foo.plan_158619554342"
};

/**
 * @listens SUITE_FINISHED"
 * @description The plan runner call runStage() to run a stage. The runStage() starts run the 1st group stories in parallel,
 * then the 'SUITE_FINISHED' event handler will continue to run the remained stories - if more suites existed in the stage.
 * When all stories finished in stage, the 'SUITE_FINISHED' handler will start run next stage until all stages finished.
 * ! Don not put event listener into function call, multi-listener will be bound. (except you prefer this) !
 */
eventBus.on('SUITE_FINISHED', async (_suite) => {
    try {
        await sleep(300);   // A little bit time for suite reports process, maybe not necessary

        /* Decrease the unfinished suites number */
        totalStageSuites = totalStageSuites > 0 ? totalStageSuites - 1 : 0;

        /*
            The stop request form SHM sets gloabl variable - "process.env.HDW_BREAK = true", it will clear current plan to terminate running.
            The "process.env.HDW_BREAK" signal also works after each step finished to terminate running, but it cannot break running in the middle of a step.
        */
        if (`${process.env.HDW_BREAK}` === 'true') {
            plan.stages = [];           // Clear all stages in the plan to prevent run further stories
        }

        /* Set story "failed" staus */
        storyStatus.map((ss) => {
            if (ss.story === _suite.story) {
                ss.status = _suite.status ? _suite.status : "failed";
            }
            return true;
        });


        if (totalStageSuites > 0) {
            /*
                totalStageSuites: Suites not finished in current stage (including suites are running now)
                waitingSuites: Suites not started in current stage (not-including suites are running now)
            */
            if (waitingSuites.length > 0) {

                /* A worker is idle after a story finished, pop out a story and run it */
                const _suite = waitingSuites.pop();
                suiteRunr(_suite, stageParams);

                /* Set story "run" staus */
                storyStatus.map((ss) => {
                    if (`${ss.story}` === _suite.story) {
                        ss.status = "run";
                    }
                    return true;
                });

                /* ---------- honsole story status output ---------- */
                cnsl.updateSuitesInfo(storyStatus);

            } else {
                /* No story is waiting-list in this stage, do nothing, just wait current running stories finished */

                /* ---------- honsole story status output ---------- */
                cnsl.updateSuitesInfo(storyStatus);

            }

        } else if (stageIdx < plan.stages.length) {
            /* Creent stage finished, but there are more stages are waiting to run in the plan */
            // eventBus.emit('STAGE_FINISHED');        // No listener now

            /* ---------- honsole story status output ---------- */
            cnsl.updateSuitesInfo(storyStatus);
            cnsl.clearProgress();
            cnsl.setProgress(1);

            /* Start run next stage */
            runStage(plan.stages[stageIdx]);

        } else {
            /*
                All stages finished or current plan is forced to break by "process.env.HDW_BREAK".
                Close the browser, the opened pages and current context will be closed in 'closeBrowser()' before browser is closed
            */
            await contextManager.closeBrowser();

            /* ---------- honsole story status output ---------- */
            cnsl.clearProgress();
            cnsl.setProgress(1);
            cnsl.updateSuitesInfo(storyStatus);

            if (`${process.env["HDW_BREAK"]}` !== 'false') {

                /* clean current record and screenshots, the latest record under reports/ will be clear after breaking */
                const storyFiles = glob.sync(path.join(config._rootPath, config.reportPath, '*.*'));
                for (const file of storyFiles) {
                    await unlinkPromise(file);
                }
                // console.log(`\n-- Alert@planRunr -- <${plan.title}> is teminated by SHM stop command ...\n`);

            } else {
                /* --------- Record ------------ */
                record.mkSummary();
                await record.save(planTree);    // Finally, the json result is generated, the latest record is ready for presenting.

                /* ---------- honsole print the report table ---------- */
                if (`${process.env.NODE_ENV}` !== 'production') {
                    cnsl.showResult();
                }

            }
            
            /* Indicate handow engine the plan finished */
            eventBus.emit('HDW_TEST_FINISHED');
        }
    } catch (err) {
        await oops(err);
    }
});