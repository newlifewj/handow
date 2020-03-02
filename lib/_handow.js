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
const fs = require('fs');
const util = require('util');
const path = require('path');
const glob = require('glob');
const _ = require('lodash');
const wfPromise = util.promisify(fs.writeFile);

const planRunr = require('./planRunr');
const parseStory = require('./parseStory');
const buildSteps = require('./buildSteps');
const buildPlanTree = require('./buildPlanTree');
const cnsl = require('./honsole');
const sleep = util.promisify(setTimeout);
const config = require('./planConfig').get();

let pTree = null;
let runningPlan;

/**
 * Build the plan tree for SHM render for "tree burning". The tree is built before each running, and could be built by SHM call.
 * 
 * @param {object} plan - the plan object (the path property of plan specify the file path)
 * 
 * @return {Promise} - the tree object (before tree return, the *.tree.json file is persisted sibling with plan or story)
 */
const runBuildTree = async (plan) => {
    const planTree = await buildPlanTree(plan);

    let treePath;
    if (plan.path.endsWith(".plan.json")) {
        treePath = `${plan.path.substring(0, plan.path.length - 10)}.tree.json`;
        fs.writeFileSync(treePath, JSON.stringify(planTree));
    } else if (plan.path.endsWith(".feature")) {
        treePath = `${plan.path.substring(0, plan.path.length - 8)}.tree.json`;
        fs.writeFileSync(treePath, JSON.stringify(planTree));
    } else {
        return null;
    }
    pTree = planTree;
    return planTree;
};

const runPlan = async ( _plan, workers ) => {
    // import plan json as plan object
    const plan = require(_plan);

    // Add file path of the plan
    plan['path'] = _plan;

    // If no title defined, using file name as title
    plan["plan"] = path.basename(_plan).slice(0, -5);
    if ( !plan["title"] ) {
        plan["title"] = path.basename(_plan).slice(0, -5);
    }

    runningPlan = plan;
    // THINKING: How to use plan config?
    // Extend local config in the plan
    // config = deepExtend( config, plan.config );

    // Before start plan, generate the plan Tree
    pTree = await runBuildTree(plan);

    await planRunr.run(plan, workers);
};

/**
 * Run a story by wrapping it in a pan, so the virtual plan name is the story name.
 * 
 * @param {string} story - the full path of a story
 * @param {number} wkrs  - workers number
 */
const runStory = async ( _story, wkrs ) => {

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

        runningPlan = plan;

        // Before start plan, generate the plan Tree
        pTree = await runBuildTree(plan);

        await planRunr.run(plan, workers);
    } else {
        throw new TypeError(`No story found by path - ${_story}`);
    }
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

const getHandowStatus = async () => {
    return {
        running: await planRunr.isRunning(),
        plan: runningPlan,
        tree: pTree
    };
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
    parseStories: runParseStories,
    buildSteps: runBuildSteps,
    buildTree: runBuildTree,
    handowStatus: getHandowStatus
};

