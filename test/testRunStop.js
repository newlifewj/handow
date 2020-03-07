'use strict';

/**
 * Dev test storyRunr run a story object
 */

const handow = require('../lib/_handow');
const appRoot = require("app-root-path");
const path = require('path');
const util = require('util');
const sleep = util.promisify(setTimeout);


( async () => {
    try {
        handow.runPlan( path.join(`${appRoot}`, 'demo/project/demo.plan.json') );
        await sleep(10000);
        handow.stop();
        console.log("Stoped");
    } catch (e) {}
} )();