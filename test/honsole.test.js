'use strict';

// https://gist.github.com/timneutkens/f2933558b8739bbf09104fb27c5c9664
// Node native API readline
// npm progress
// chalk

const path = require('path');
const cnsl = require('../honsole');
const deepExtend = require('deep-extend');
const util = require('util');
const sleep = util.promisify(setTimeout);
// const config = deepExtend( require('../_config'), require('../../config') );
const config = require('../planConfig').get();

const suite1 = require( './story111.json');
const suite2 = require( './story222.json');

// const term = require( 'terminal-kit' ).terminal;
const st1 = [
    { story: "story01.feature", status: "run" },
    { story: "story02.feature", status: "success" },
    { story: "story03.feature", status: "failed" },
    { story: "story04.feature", status: "success" },
    { story: "story05.feature" },
    { story: "story06.feature", status: "pending" },
    { story: "story07.feature" },
    { story: "story08.feature", status: "success" },
    { story: "story09.feature", status: "run" },
    { story: "story10.feature", status: "run" },
    { story: "story11.feature" },
    { story: "story12.feature" },
    { story: "story13.feature" },
    { story: "story14.feature" },
    { story: "story15.feature", status: "run" },
    { story: "story16.feature" },
    { story: "story17.feature" },
    { story: "story18.feature" }
];

const st2 = [
    { story: "story01.feature", status: "failed" },
    { story: "story02.feature", status: "success" },
    { story: "story03.feature", status: "failed" },
    { story: "story04.feature", status: "success" },
    { story: "story05.feature" },
    { story: "story06.feature", status: "failed" },
    { story: "story07.feature" },
    { story: "story08.feature", status: "success" },
    { story: "story09.feature", status: "success" },
    { story: "story10.feature", status: "run" },
    { story: "story11.feature" },
    { story: "story12.feature" },
    { story: "story13.feature", status: "run" },
    { story: "story14.feature" },
    { story: "story15.feature" },
    { story: "story16.feature", status: "run" },
    { story: "story17.feature", status: "run" },
    { story: "story18.feature" }
];

const st3 = [
    { story: "story01.feature", status: "failed" },
    { story: "story02.feature", status: "success" },
    { story: "story03.feature", status: "failed" },
    { story: "story04.feature", status: "success" },
    { story: "story05.feature", status: "success" },
    { story: "story06.feature", status: "failed" },
    { story: "story07.feature", status: "success" },
    { story: "story08.feature", status: "success" },
    { story: "story09.feature", status: "success" },
    { story: "story10.feature", status: "success" },
    { story: "story11.feature", status: "success" },
    { story: "story12.feature", status: "success" },
    { story: "story13.feature", status: "success" },
    { story: "story14.feature", status: "success" },
    { story: "story15.feature", status: "success" },
    { story: "story16.feature", status: "success" },
    { story: "story17.feature", status: "failed" },
    { story: "story18.feature", status: "success" }
];

const testStage = async () => {
    cnsl.clear();
    cnsl.startWarning();
    // cnsl.startStage("Stage for testing managers search books");

    cnsl.runSuites(st1);

    await sleep(1000);
    cnsl.setProgress(0.05);
    await sleep(1000);
    cnsl.setProgress(0.11);
    await sleep(2000);
    cnsl.setProgress(0.41);
    await sleep(1000);
    cnsl.setProgress(0.71);
    cnsl.updateSuitesInfo(st2);
    await sleep(2000);
    cnsl.setProgress(0.71);
    await sleep(1000);
    // cnsl.setProgress(1);

    cnsl.clearProgress();
    cnsl.setProgress(1);
    cnsl.updateSuitesInfo(st3);

    const showResult = {};
    cnsl.showResult(showResult);

    await sleep(1000);


    // ---------- Next stage
    cnsl.runSuites(st1);

    await sleep(1000);
    cnsl.setProgress(0.05);
    await sleep(1000);
    cnsl.setProgress(0.11);
    await sleep(2000);
    cnsl.setProgress(0.41);
    await sleep(1000);
    cnsl.setProgress(0.71);
    cnsl.updateSuitesInfo(st2);
    await sleep(2000);
    cnsl.setProgress(0.71);
    await sleep(1000);

    cnsl.clearProgress();
    cnsl.setProgress(1);
    cnsl.updateSuitesInfo(st3);

    // const showResult = {};
    cnsl.showResult(showResult);

    // await sleep(1000);

    // cnsl.setProgress(0.01);
    // cnsl.setProgress(1);
};

const testSuites = async () => {
    cnsl.clear();
    cnsl.startWarning();
    // cnsl.reset();
    // cnsl.remindScreenWidth();

    cnsl.showResult();

    cnsl.runSuites(st1);

    await sleep(1000);
    cnsl.setProgress(0.05);
    await sleep(1000);
    cnsl.setProgress(0.11);
    await sleep(2000);
    cnsl.setProgress(0.41);
    await sleep(1000);
    cnsl.setProgress(0.71);
    cnsl.updateSuitesInfo(st2);
    await sleep(2000);
    cnsl.setProgress(0.71);
    await sleep(1000);
    cnsl.setProgress(1);
    cnsl.updateSuitesInfo(st3);
};

testSuites();

//

