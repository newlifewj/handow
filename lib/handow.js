#!/usr/bin/env node

/* eslint-disable node/shebang */
/**
 * Node program as cli, add it to "bin": { "handow": "handow.js"}
 * For dev env, run "npm link" to install it as global reference ("npm unlink" to remove it)
 * "npm link" will install the node program as global symblink, available to all paths
 * https://medium.com/netscape/a-guide-to-create-a-nodejs-command-line-package-c2166ad0452e
 *
 * After install the clic, we can run > handow --plan --path, otherwise > node ./handow --plan --path
 * 
 * !!! the cli interface is only invoked by native running, here handow try to co-operate with SHM.
 */

'use strict';

/** ******************************************************************
 * Handow main entry to run plan, suite(s) and build stories and steps
 * handow -plan|suite|buildsteps|parsestory -path
 * *******************************************************************/
const path = require('path');
const _ = require('lodash');
const appRoot = require("app-root-path");
const https = require('https');
const httpAgent = require('axios').create({
    httpsAgent: new https.Agent({  
      rejectUnauthorized: false
    })
});

const eventBus = require('./eventBus');
const hdw = require('./_handow');
const cnsl = require('./honsole');
const planConfig = require('./planConfig');

let shmSetting;
// SHM setting file is created by developer and put to appRoot for SHM config
try {
    shmSetting = require( path.join(`${appRoot}`, 'shmSetting.json') ); // import shm-setting if SHM installed
} catch (err) {
    shmSetting = null;    // null means no SHM in current handow project.
}

const hdwCLI = (runner, target, workers) => {
    process.env["LOCAL_RUN"] = true;
    if ( runner === "plan" && target ) {
        // Send native running pid to SHM, make it possible to kill the native-running process by other process
        if (shmSetting) {
            httpAgent.request({
                url: "/handow/handowstatus",
                baseURL: `http://localhost:${shmSetting.httpPort}/api`,
                method: "POST",
                headers: { 'X-HANDOW-TOKEN': shmSetting.shmToken },
                data: { pid: process.pid }
            })
            .then( () => {} )
            .catch( (err) => {} )
            .finally( () => {} );
        }
        
        // Anyway, start run except it is running now
        const _target = target.endsWith('.plan.json') ? target : `${target}.plan.json`;

        hdw.runPlan( path.join(planConfig.get()._rootPath, _target), workers );
        // run a plan after re-build steps and re-parse stories.
        // planRunr use config find out stories and steps.
        
    } else if ( ( runner === "story" || runner === "stories" ) && target ) {
        // Send native running pid to SHM, make it possible to kill the native-running process by other process
        if (shmSetting) {
            httpAgent.request({
                url: "/handow/handowstatus",
                baseURL: `http://localhost:${shmSetting.httpPort}/api`,
                method: "POST",
                data: { pid: process.pid }
            })
            .then( () => {} )
            .catch( (err) => {} )
            .finally( () => {} );
        }
        
        // Anyway, start run except it is running now
        const _target = target.endsWith('.feature') ? target : `${target}.feature`;
        hdw.runStory( path.join(planConfig.get()._rootPath, _target), '1' );
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
        // process.exit();
    }
};

/**
 * Start CLI
 */
try {
    const runner = process.argv[2] ? process.argv[2].replace("--", "").trim().toLocaleLowerCase() : null;
    const target = process.argv[3] ? process.argv[3].replace("--", "").trim() : null;
    const workers = process.argv[4] ? process.argv[4].replace("--", "").trim().toLocaleLowerCase() : planConfig.get().workers;

    if (shmSetting) {       // shmSetting existing is a clue to know SHM maybe installed
        httpAgent.request({
            url: "/info",
            baseURL: `http://localhost:${shmSetting.httpPort}/api`,
            method: "GET"
        })
        .then( (resp) => {
            if ( resp.status == '200' && resp.data && resp.data.data['isRunning'] ) {
                // ToDo: User temimal tool output color and formated message instead of console.log.
                // SHM running or another native running will block the native run
                console.log(`Rejected due to handow has been running by SHM at this moment.`);
                return false;   // The only situation when native running is blocked
            } else if ( resp.status == '200' && resp.data && resp.data.data['nativeRunPid'] ) {
                try {
                    process.kill( resp.data.data['nativeRunPid'], 'SIGINT' );      // kill other native-run if it's running
                } catch (err) {
                    // May have exception when kill process group in Windows, ignore it.
                }
                hdwCLI(runner, target, workers);
                cnsl.cliStarting("RecognizedBySHM");
            } else {
                hdwCLI(runner, target, workers);
                cnsl.cliStarting("NotRecognizedBySHM");
            }
        })
        .catch( (err) => {
            hdwCLI(runner, target, workers);
            cnsl.cliStarting("FailedConnectedWithSHM");
        } );
    } else {
        hdwCLI(runner, target, workers);
        cnsl.cliStarting("NoSHM");
    }

} catch (e) {
    // Native running terminated by exception
    eventBus.emit("HDW_TEST_FINISHED");     // trigger post-process after test finished
    console.log(e);
}

