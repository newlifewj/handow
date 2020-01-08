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
const path = require('path');
const _ = require('lodash');

const hdw = require('./_handow');
const cnsl = require('./honsole');
const planConfig = require('./planConfig');

try {
    const runner = process.argv[2] ? process.argv[2].replace("--", "").trim().toLocaleLowerCase() : null;
    const target = process.argv[3] ? process.argv[3].replace("--", "").trim().toLocaleLowerCase() : null;
    const workers = process.argv[4] ? process.argv[4].replace("--", "").trim().toLocaleLowerCase() : planConfig.get().workers;
    
    if ( runner === "plan" && target ) {
        const _target = target.endsWith('.json') ? target : `${target}.json`;
        hdw.runPlan( path.join(planConfig.get()._rootPath, _target), workers );
        // run a plan after re-build steps and re-parse stories.
        // planRunr use config find out stories and steps.
    } else if ( ( runner === "story" || runner === "stories" ) && target ) {
        const _target = target.endsWith('.feature') ? target : `${target}.feature`;
        hdw.runStories( path.join(planConfig.get()._rootPath, _target), '1' );
        // run a suite by the JSON suite specified after re-build steps.
        // "target" should be relative with application root, not depending on config.
        // but still use config find out steps.
    } else if (  runner === "parsestory" || runner === "parsestories" ) {
        if ( target ) {
            // parse stories specified, target relative app root, without care about config
            hdw.parseStories( path.join(planConfig.get()._rootPath, target) );
        } else {
            hdw.parseStories( path.join(planConfig.get()._rootPath, planConfig.get().stroyPath) );
            // parse all stories in story path specified by config
        }
        // parse a stories by specify a directory wildcard or one single story.
        // "targetPath" should be relative with application root, not depending on config.
    } else if ( runner === "buildsteps" || runner === "buildstep" ) {
            const customStepsPath = target ? target : planConfig.get().stepsPath;
            hdw.buildSteps( customStepsPath );
    } else {
        cnsl.cliHelp();
        process.exit();
    }

    cnsl.cliStarting();

} catch (e) {
    // cnsl.error();
    console.log(e);
    process.exit();
}

