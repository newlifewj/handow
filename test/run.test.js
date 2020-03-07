'use strict';

/**
 * Dev test storyRunr run a story object
 */

const handow = require('../lib/_handow');
const appRoot = require("app-root-path");
const path = require('path');


( () => {
    try {
        handow.runPlan( path.join(`${appRoot}`, 'demo/project/demo.plan.json') );
    } catch (e) {
        console.log("ERROOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOR");
    }
} )();