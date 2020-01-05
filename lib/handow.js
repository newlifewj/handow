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
const fs = require('fs');
const util = require('util');
const path = require('path');
const glob = require('glob');
const _ = require('lodash');

const planRunr = require('./planRunr');
const parseStory = require('./parseStory');
const buildSteps = require('./buildSteps');
const cnsl = require('./honsole');

const eventBus = require('./eventBus');

// let config = deepExtend( require('./_config'), require('../config') );
const config = require('./planConfig').get();

const rfPromise = util.promisify(fs.readFile);
const wfPromise = util.promisify(fs.writeFile);

const sleep = util.promisify(setTimeout);

let waitingSuites = [];

// Destructing assignment, receive the cli parameters
// const [,, ...args] = process.argv;

const runPlan = async ( _plan, workers ) => {
    const plan = require(_plan);
    // If no title defined, using file name as title
    plan["plan"] = path.basename(_plan).slice(0, -5);
    if ( !plan["title"] ) {
        plan["title"] = path.basename(_plan).slice(0, -5);
    }
    // THINKING: How to use plan config?
    // Extend local config in the plan
    // config = deepExtend( config, plan.config );

    await planRunr(plan, workers);
};

const runStories = async ( _stories, wkrs ) => {
    const workers = Number.isInteger(wkrs) && wkrs > 0 ? wkrs : config.workers;

    const stories = [];
    if ( _stories.endsWith(".feature") ) {
        stories.push( path.basename(_stories).slice(0, -8) );
    } else {
        // all .feature files in this path
        const storyFiles = glob.sync( path.join(_stories, "/*.feature") );
        // Process each custom steps file and merge with built-in steps
        for ( const file of storyFiles ) {
            stories.push( path.basename(file).slice(0, -8) );
        }
    }

    if ( stories.length > 0 ) {
        // Put stories to a single-stage plan, and then run it.
        const _plan = {
            title: "Stories test with single stage plan",
            plan: `storytest${Date.now()}`,
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
        await planRunr(_plan, workers);
    } else {
        throw new TypeError(`No story found by path - ${_stories}`);
    }
};

const runParseStories = async ( _stories ) => {
    if ( _stories.endsWith(".feature") ) {
        const storyName = path.basename(_stories).replace(".feature", ".json").trim();
        const suiteObj = await parseStory( _stories );
        await wfPromise( path.join( path.dirname(_stories), storyName), JSON.stringify(suiteObj) );
    } else {
        // all .feature files in this path
        const storyFiles = glob.sync( path.join(_stories, "/*.feature") );
        // Process each custom steps file and merge with built-in steps
        for ( const file of storyFiles ) {
            const storyName = path.basename(file).replace(".feature", ".json").trim();
            const suiteObj = await parseStory(file);
            await wfPromise( path.join( path.dirname(file), storyName), JSON.stringify(suiteObj) );
        }
    }
};

const runBuildSteps = async (customStepsPath) => {
    await buildSteps(customStepsPath);
    await sleep(5000);
};


try {
    const runner = process.argv[2] ? process.argv[2].replace("--", "").trim().toLocaleLowerCase() : null;
    const target = process.argv[3] ? process.argv[3].replace("--", "").trim().toLocaleLowerCase() : null;
    const workers = process.argv[4] ? process.argv[4].replace("--", "").trim().toLocaleLowerCase() : config.workers;
    
    if ( runner === "plan" && target ) {
        const _target = target.endsWith('.json') ? target : `${target}.json`;
        runPlan( path.join(config._rootPath, _target), workers );
        // run a plan after re-build steps and re-parse stories.
        // planRunr use config find out stories and steps.
    } else if ( ( runner === "story" || runner === "stories" ) && target ) {
        runStories( path.join(config._rootPath, target), workers );
        // run a suite by the JSON suite specified after re-build steps.
        // "target" should be relative with application root, not depending on config.
        // but still use config find out steps.
    } else if (  runner === "parsestory" || runner === "parsestories" ) {
        if ( target ) {
            // parse stories specified, target relative app root, without care about config
            runParseStories( path.join(config._rootPath, target) );
        } else {
            runParseStories( path.join(config._rootPath, config.stroyPath) );
            // parse all stories in story path specified by config
        }
        // parse a stories by specify a directory wildcard or one single story.
        // "targetPath" should be relative with application root, not depending on config.
    } else if ( runner === "buildsteps" || runner === "buildstep" ) {
            const customStepsPath = target ? target : config.stepsPath;
            runBuildSteps( customStepsPath );
    } else {
        cnsl.cliHelp();
        process.exit();
    }

    cnsl.cliStarting();

} catch (e) {
    // cnsl.error();
    console.log(e);
}

