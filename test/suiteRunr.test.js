'use strict';

/**
 * Dev test storyRunr run a story object
 */

const deepExtend = require('deep-extend');
const util = require('util');
const fs = require('fs');
const path = require('path');

// const config = deepExtend( require('../_config'), require('../../config') );
const config = require('../planConfig').get();

const cnsl = require('../honsole.js');
const herrorParse = require('../herrorParse');

const suiteRunr = require('../suiteRunr');
const story111 = require( path.join(config._rootPath, config.projectPath, 'stories/story111.json') );
const story222 = require( path.join(config._rootPath, config.projectPath, 'stories/story222.json') );

( async () => {
    try {
        await suiteRunr(story111);
        await suiteRunr(story222);
        // console.log(JSON.stringify(suiteObj, null, 2));
    } catch (e) {
        const error = herrorParse(e);
        cnsl.error(error.message);
    }
} )();