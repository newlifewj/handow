'use strict';

/**
 * Dev test compile a story file to object
 */

const deepExtend = require('deep-extend');
const util = require('util');
const fs = require('fs');
const path = require('path');
const cnsl = require('../honsole');
const herrorParse = require('../herrorParse');

const parseStory = require('../parseStory');

// const config = deepExtend( require('../_config'), require('../../config') );
const config = require('../planConfig').get();

const wfPromise = util.promisify(fs.writeFile);

( async (story) => {
    try {
        const suiteObj = await parseStory(path.join(config._rootPath, config.projectPath, `stories/${story}.feature`));

        // console.log(JSON.stringify(suiteObj, null, 2));
        await wfPromise( path.join(config._rootPath, config.projectPath, `stories/${story}.json`), JSON.stringify(suiteObj) );
    } catch (e) {
        const error = herrorParse(e);
        cnsl.error(error.message);
    }
} )( "story222" );