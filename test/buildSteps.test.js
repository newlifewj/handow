'use strict';

/**
 * Dev test build steps into bundle files
 */

const util = require('util');
const fs = require('fs');
const path = require('path');
const esprima = require('esprima');
const escodegen = require('escodegen');
const glob = require('glob');
const cnsl = require('../lib/honsole');
const herrorParse = require('../lib/herrorParse');

const buildSteps = require('../lib/buildSteps');

const deepExtend = require('deep-extend');

// const config = deepExtend( require('../_config'), require('../../config') );
const config = require('../lib/planConfig').get();

// Convert fs.readFile into Promise
const rfPromise = util.promisify(fs.readFile);

( async () => {
    try {
        // const stepsScript = await rfPromise(`${path.join(config._rootPath, "/steps/acts.step.js")}`, 'utf8');
        // const stepsEST = esprima.parseScript(stepsScript);
        // console.log(JSON.stringify(stepsEST, null, 2));

        await buildSteps();
    } catch (e) {
        const error = herrorParse(e);
        cnsl.error(error.message);
    }
} )();