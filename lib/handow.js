#!/usr/bin/env node
/* eslint-disable node/shebang */

'use strict';

/*
 * The CLI runner of handow-core, it is not a npm module
 *
 * Except providing APIs to consumer application (by _handow.js module), handow-core package also provide command interface for users run handow engine solely.
 * Add the "bin" property to current package.json - "bin": { "handow": "handow.js"} https://medium.com/netscape/a-guide-to-create-a-nodejs-command-line-package-c2166ad0452e
 * Then we can invoke the CLI by 'package runner', e.g. $ npx handow ----story --/project/stories/ExampleStory.feature.
 * Or add npm scripts to package.json and run handow with npm runner. E.g. "scripts": { "runStory1": "handow ----story --/project/stories/story1.feature" }
 * Then run it in command line: $ npm run runStory1
 */

const path = require('path');
const appRoot = require("app-root-path");
const https = require('https');
const httpAgent = require('axios').create({
    httpsAgent: new https.Agent({  
      rejectUnauthorized: false
    })
});

const eventBus = require('./eventBus');
const hdw = require('./_handow');   // The handow CLI refer handow APIs - the '_handow.js' module
const cnsl = require('./honsole');
const planConfig = require('./planConfig');

/*
    SHM setting file is optionally created by developer or added by othe components, and located under appRoot for SHM config.
    It is mandatory if handow-core work with handow-shm.
*/
let shmSetting;
try {
    shmSetting = require( path.join(`${appRoot}`, 'shmSetting.json') ); // import shm-setting if SHM installed
} catch (err) {
    shmSetting = null;    // null means no SHM in current handow project.
}

/**
 * @function hdwCLI The main executing function, it calls handow APTs to perform the CLI task
 * @param {string} runner The runner identifier, "plan" | "story" | "stories" | "parsestory" | "parsestories" | "buildstep" | "buildsteps"
 * @param {string} target Optional, could be path of the target file
 * @param {number} workers Optional, default is 1, only valid for the plan runner
 */
const hdwCLI = (runner, target, workers) => {
    process.env["LOCAL_RUN"] = true;
    if ( (runner === "plan" || runner === "story" || runner === "stories")  && target ) {
        /*
            Send native running pid to SHM if shmSetting available, so that the SHM can kill the native-running process.
            This is only for Handow local running, will not happen when SHM deployed in remote server
        */
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
        
        /*
            Call handow API to run the plan or story
            The plan or story must be specified by path relative with the '_rootPath' defined in current config
        */
        let _target;
        if (runner === "plan") {
            _target = target.endsWith('.plan.json') ? target : `${target}.plan.json`;
            hdw.runPlan( path.join(planConfig.get()._rootPath, _target), workers, planConfig.get().browser );
        } else {
            _target = target.endsWith('.feature') ? target : `${target}.feature`;
            hdw.runStory( path.join(planConfig.get()._rootPath, _target), '1', planConfig.get().browser );
        }

    } else if (  runner === "parsestory" || runner === "parsestories" ) {
        /*
            Parse specific story or all stories into a JSON object and save them sibling with the story files, mostly for developing.
            Handow always parse stories into JSON object before run them, but doesn't save the relevant JSON file.
        */
        if ( target ) {
            hdw.parseStories( path.join(planConfig.get()._rootPath, target) );  // Parse specific story
        } else {
            hdw.parseStories( path.join(planConfig.get()._rootPath, planConfig.get().stroyPath) );  // Parse all stories in story path
        }
       
    } else if ( runner === "buildsteps" || runner === "buildstep" ) {
        /*
            Rebuild custom steps
        */
        const customStepsPath = target ? target : planConfig.get().stepsPath;
        hdw.buildSteps( customStepsPath );
    } else {
        /*
            Output the Help info to console
        */
        cnsl.cliHelp();
        // process.exit(); ??
    }
};

/*
    The main executing script of the CLI runner, accept the 'runner', 'target' and 'worker' arguments from the command input.

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
            /*
                The SHM server has started and accessable by native runner.
            */
            if ( `${resp.status}` === '200' && resp.data && resp.data.data['isRunning'] ) {
                /*
                    Local (native) runner is blocked if the SHM server is running any test
                */
                console.log(`Rejected due to handow has been running by SHM at this moment.`);
                return false;

            } else if ( `${resp.status}` === '200' && resp.data && resp.data.data['nativeRunPid'] ) {
                /*
                    This case shouldn't happen.
                    Local runner will stop other native running by kill its process, and then call hdwCLI execute current command
                */
                try {
                    process.kill( resp.data.data['nativeRunPid'], 'SIGINT' );      // kill other native-run if it's running
                } catch (err) {
                    // May have exception when kill process group in Windows, ignore it.
                }
                hdwCLI(runner, target, workers);
                cnsl.cliStarting("RecognizedBySHM");

            } else {
                /*
                    Call hdwCLI execute current command and start output to console
                */
                hdwCLI(runner, target, workers);
                cnsl.cliStarting("NotRecognizedBySHM");
            }
        })
        .catch( (err) => {
            /*
                The SHM server is not accessable, e.g. the SHM server is not started, failed due to any reason or not installed.
            */
            hdwCLI(runner, target, workers);
            cnsl.cliStarting("FailedConnectedWithSHM");
        } );
    } else {
        /*
            The SHM server is not install because no 'shmSetting.json' was found
        */
        hdwCLI(runner, target, workers);
        cnsl.cliStarting("NoSHM");
    }

} catch (e) {
    /*
        Handle exception without start the runner, broadcast event signal "HDW_TEST_FINISHED" to current app context
    */
    eventBus.emit("HDW_TEST_FINISHED");     // trigger post-process after test finished
    console.log(e);
}

