#!/usr/bin/env node

/* eslint-disable node/shebang */
/**
 * Node program as cli, add it to "bin": { "handow": "handow.js"}
 * For dev env, run "npm link" to install it as global reference ("npm unlink" to remove it)
 * "npm link" will install the node program as global symblink, available to all paths
 * https://medium.com/netscape/a-guide-to-create-a-nodejs-command-line-package-c2166ad0452e
 *
 * After install the clic, we can run > handow --plan --path, otherwise > node ./handow --plan --path
 */

'use strict';

/** ******************************************************************
 * Handow main entry to run plan, suite(s) and build stories and steps
 * handow -plan|suite|buildsteps|parsestory -path
 * *******************************************************************/
const appRoot = require("app-root-path");
const https = require('https');
const httpAgent = require('axios').create({
    httpsAgent: new https.Agent({  
      rejectUnauthorized: false
    })
});
const fs = require('fs');
const util = require('util');
const path = require('path');
const glob = require('glob');
const _ = require('lodash');
const wfPromise = util.promisify(fs.writeFile);

const eventBus = require('./eventBus');
const planRunr = require('./planRunr');
const parseStory = require('./parseStory');
const buildSteps = require('./buildSteps');
const buildPlanTree = require('./buildPlanTree');
const cnsl = require('./honsole');
const sleep = util.promisify(setTimeout);
const config = require('./planConfig').get();

let shmSetting;
// SHM setting file is created by developer and put to appRoot for SHM config
try {
    shmSetting = require( path.join(`${appRoot}`, 'shmSetting.json') ); // import shm-setting if SHM installed
} catch (err) {
    shmSetting = null;    // null means no SHM in current handow project.
}

// handow running status, they are only set in shm running process.
let pTree = null;
let runningPlan = null;
let isRunning = false;
let nativeRunPid = null;

/**
 * post-process after test finished (either normally or by exception)
 */
eventBus.on("HDW_TEST_FINISHED", () => {
    process.env["HDW_BREAK"] = false;
    // "nativeRunPid !== null" only when native-running, it is set by native running from "POST: /api/handowstatus"
    if (shmSetting && nativeRunPid) {
        // Reset isRunning status and the native-run processid
        httpAgent.request({
            url: "/handow/handowstatus",
            baseURL: `http://localhost:${shmSetting.httpPort}/api`,
            method: "POST",
            data: { pid: null, running: false } 
        });

    } 

    // Eight native or shm run, always reset the running status to original state
    pTree = null;
    runningPlan = null;
    isRunning = false;
    nativeRunPid = null;
});

/**
 * Build the plan tree for SHM render for "tree burning". The tree is built before each running, and could be built by SHM call.
 * 
 * @param {object} plan - the plan object (the path property of plan specify the file path)
 * 
 * @return {Promise} - the tree object (before tree return, the *.tree.json file is persisted sibling with plan or story)
 */
const runBuildTree = async (plan) => {
    // console.log(plan)
    const planTree = await buildPlanTree(plan);

    let treePath;
    if (typeof plan === 'string' && plan.endsWith(".plan.json")) {
        treePath = `${plan.substring(0, plan.length - 10)}.tree.json`;
        fs.writeFileSync(treePath, JSON.stringify(planTree));
    } else if (typeof plan === 'string' && plan.endsWith(".feature")) {
        treePath = `${plan.substring(0, plan.length - 8)}.tree.json`;
        fs.writeFileSync(treePath, JSON.stringify(planTree));
    } else if (typeof plan === 'object' && plan.path.endsWith(".plan.json")) {
        treePath = `${plan.path.substring(0, plan.path.length - 10)}.tree.json`;
        fs.writeFileSync(treePath, JSON.stringify(planTree));
    } else if (typeof plan === 'object' && plan.path.endsWith(".feature")) {
        treePath = `${plan.path.substring(0, plan.path.length - 8)}.tree.json`;
        fs.writeFileSync(treePath, JSON.stringify(planTree));
    } else {
        return null;
    }
    
    pTree = planTree;
    return planTree;
};

const runPlan = async ( _plan, wkrs ) => {
    process.env["HDW_BREAK"] = false;
    
    try {
        // import plan json as plan object
        const plan = require(_plan);

        // Add file path of the plan
        plan['path'] = _plan;

        // If no title defined, using file name as title
        plan["plan"] = path.basename(_plan).slice(0, -5);
        if ( !plan["title"] ) {
            plan["title"] = path.basename(_plan).slice(0, -5);
        }

        // THINKING: How to use plan config?
        // Extend local config in the plan
        // config = deepExtend( config, plan.config );

        // Before start plan, generate the plan Tree
        // pTree = await runBuildTree(plan);

        // ***Note: see buttom explanation ...
        runningPlan = plan;
        // pTree = await runBuildTree(plan);
        isRunning = true;


        const workers = Number.isInteger(wkrs) && wkrs > 0 ? wkrs : config.workers;
        await planRunr(plan, workers);

    } catch (err) {
        if ( err["code"] && err["code"] === "000" ) {
            return false;
        } else {
            return err.message;
        }
    }
    
};

/**
 * Run a story by wrapping it in a pan, so the virtual plan name is the story name.
 * 
 * @param {string} story - the full path of a story
 * @param {number} wkrs  - workers number
 */
const runStory = async ( _story, wkrs ) => {
    process.env["HDW_BREAK"] = false;
    const workers = Number.isInteger(wkrs) && wkrs > 0 ? wkrs : config.workers;

    // Actualy only one story in stories[]
    const stories = [];
    if ( _story.endsWith(".feature") ) {    // story path must be a .feature file
        stories.push( path.basename(_story).slice(0, -8) );
    }

    if ( stories.length > 0 ) {
        // Put stories to a single-stage plan, and then run it.
        const plan = {
            title: "Single stage plan for a story testing",
            path: `${_story}`,
            plan: `${stories.join()}`,
            stages: [
                {
                    stage: "Test",
                    description: "Stories test with single stage plan",
                    stories: stories
                }
            ],
            config: {
                _testLocalJSON: true
            }
        };

        // ***Note: see buttom explanation ...
        runningPlan = plan;
        // pTree = await runBuildTree(plan);
        isRunning = true;
        // -----------------------------------

        await planRunr(plan, workers);
    } else {
        throw new TypeError(`No story found by path - ${_story}`);
    }
};

/**
 * SHM doesn't force to shut down handow running due to promise cancel issues.
 * Instead, it will trigger a flag: process.env["HDW_BREAK"], which will forbid handow continue current running and go to end normally.
 */
const stop = () => {
    process.env["HDW_BREAK"] = true;
    // eventBus.emit('STOP_RUNNING');
};

const runParseStories = async ( _stories ) => {
    if ( _stories.endsWith(".feature") ) {
        const storyName = path.basename(_stories).replace(".feature", ".json").trim();
        const suiteObj = parseStory( _stories );
        await wfPromise( path.join( path.dirname(_stories), storyName), JSON.stringify(suiteObj) );
    } else {
        // all .feature files in this path
        const storyFiles = glob.sync( path.join(_stories, "/*.feature") );
        // Process each custom steps file and merge with built-in steps
        for ( const file of storyFiles ) {
            const storyName = path.basename(file).replace(".feature", ".json").trim();
            const suiteObj = parseStory(file);
            await wfPromise( path.join( path.dirname(file), storyName), JSON.stringify(suiteObj) );
        }
    }
};

const runBuildSteps = async (customStepsPath) => {
    await buildSteps(customStepsPath);
    // await sleep(5000);
};

// Only SHM need get handowStatus because this is only called by SHM router API.
// When SHM access this method:
const getHandowStatus = () => {
    return {
        running: isRunning,
        nativeRunPid: nativeRunPid,         // it is null with shm-running
        plan: runningPlan,      // null for native running
        tree: pTree             // null for native running
    };
};

// This API is only called by SHM POST: /api/handow/handowstatus routes, set the native running pid.
const setRunningStatus = (pid) => {
    nativeRunPid = pid;
};


// Create direactoies for ste-bundles and report files
if (!fs.existsSync(path.join(`${config._rootPath}`, 'stepBundles'))) {  
    fs.mkdirSync(path.join(`${config._rootPath}`, 'stepBundles'));
}
if (!fs.existsSync(path.join(`${config._rootPath}`, `${config.reportPath}`))) {
    fs.mkdirSync(path.join(`${config._rootPath}`, `${config.reportPath}`));
}
if (!fs.existsSync(path.join(`${config._rootPath}`, `${config.reportPath}`, 'archives'))) {
    fs.mkdirSync(path.join(`${config._rootPath}`, `${config.reportPath}`, 'archives'));
}

module.exports = {
    runPlan: runPlan,
    runStory: runStory,
    stop: stop,
    parseStories: runParseStories,
    buildSteps: runBuildSteps,
    buildTree: runBuildTree,
    handowStatus: getHandowStatus,
    setRunningStatus: setRunningStatus     // Only called by http call from native running, set to process.id or null
};

/*
    setNativaRunPid() is used to maintain native-running process-id, set to native running process.pid on native running,
    reset to null when native running stopped
*/


/**
 * Explain the tricky of setting handowStaus.
 * 
 * runningPlan = plan;
 * pTree = await runBuildTree(plan);
 * isRunning = true;
 * 
 * These 3 lines set handow status to handow instance in CURRENT PROCESS. If current running is shm-running, it is okay.
 * SHMUI can access these data. However, native-running set them to its handow instance too, but the native-run instance licates
 * in other process than SHM-RUN. That means SHMUI couldn't get status of native-run because shm just access the handow of its process.
 * 
 * In order to resolve this defect (make SHMUI knowing if native handow is running or not), the native-run will pass its process-id (pid)
 * to shm-run process if shm installed and launched. So that SHMUI will know handow running state even it is from native-run.
 * 
 * SHM can not start another running until it finished or stopped from SHMUI. SHM can start without care about native-run, it will kill
 * the native-run process before sratup, that is why the pid is imprtant for SHM running.
 * 
 * Pay attention: The native-run status passed to SHM context will not include "runningPlan" and "planTree". So the SHMUI can not see
 * the tree-burning for native-running. But SHMUI know native-run is running or not, and stop it automatically before SHM running
 */

