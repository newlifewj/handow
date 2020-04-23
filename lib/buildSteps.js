'use strict';

/**
 * Build step bundle files.
 *
 * @module buildSteps
 */

const fs = require('fs');
const fsp = require('fs').promises;
const util = require('util');
const path = require('path');
const deepExtend = require('deep-extend');
// const esprima = require('esprima');
const escodegen = require('escodegen');
const glob = require('glob');

const genEST = require('./genEST');
const stepSnippets = require('./stepSnippets');
const syncRsrc = require('./syncResource');
// const record = require('./record');

// const config = deepExtend( require('./_config'), require('../config') );
const config = require('./planConfig').get();
const appRoot = require('app-root-path');

// const wfPromise = util.promisify(fs.writeFile);

// const sleep = util.promisify(setTimeout);

/**
 * Parse built-in and custom step files and generate bundles.
 *
 * @param {string} customStepsPath - optionally specify custom steps path (directory).
 * @return {Promise} an object with totalActs and totalFacts buit, 2 bundle files should be generated/updated after build success.
 */
// TODO: story file need phase name, add it with @scenario tag. Otherwise not good for render reports

module.exports = async (customStepsPath) => {
    try {
        // Prepare the bundle file frame EST
        const estFrame = genEST.stepsBundleFrame();

        // console.log(JSON.stringify(estFrame, null, 2));
        // Access built-in steps relative with step builder, keep this directory relationship
        
        let _steps = await stepSnippets( path.join(`${__dirname}`, 'steps/acts.step.js') );
        let _actSnippets = _steps["acts"];
        let _variables = _steps["variables"];       // variables is all declarations, merge them together and put to all step bundle

        _steps = await stepSnippets( path.join(`${__dirname}`, 'steps/facts.step.js') );

        let _factSnippets = _steps["facts"];
        _variables = _variables.concat(_steps["variables"]);

        const customPath = customStepsPath ? customStepsPath : config.stepsPath
                            ? path.join(config._rootPath, config.stepsPath) : null;

        if ( customPath ) {
            const stepFiles = glob.sync( path.join(customPath, "/*.step.js") );

            // Process each custom steps file and merge with built-in steps
            for ( const file of stepFiles ) {
                _steps = await stepSnippets(file);
                _actSnippets = deepExtend( _actSnippets, _steps["acts"] );
                _factSnippets = deepExtend( _factSnippets, _steps["facts"] );
                _variables = _variables.concat(_steps["variables"]);
            }
        }

        // Insert variable declarations to estFrame, avoid duplicated variables
        const _vars = {};
        for ( const _var of _variables ) {
            const _name = _var["declarations"][0]["id"]["name"];
            if (!_vars[_name]) {
                estFrame.body.splice( 1, 0, _var );
                _vars[_name] = true;
            }
        }

        // const actsBundleEST = { ...estFrame };
        // const actsBundleEST = Object.assign( {}, estFrame );
        // !!! Must copy values, "spread" and "assign" just handle reference
        const actsBundleEST = deepExtend( {}, estFrame );
        const factsBundleEST = deepExtend( {}, estFrame );

        const _idx = estFrame.body.length - 1;

        for ( const act in _actSnippets ) {
            if ( _actSnippets[act] ) {
                actsBundleEST.body[_idx]["expression"]["right"]["properties"].push( genEST.stepBundle( _actSnippets[act], act ) );
            }
        }

        for ( const fact in _factSnippets ) {
            if ( _factSnippets[fact] ) {
                factsBundleEST.body[_idx]["expression"]["right"]["properties"].push( genEST.stepBundle( _factSnippets[fact], fact ) );
            }
        }

        // TODO: inject "page" and "config" to step arguments, more??

        // The result of building steps are 2 bundle objects, locateed in "/stepBundles/..."
        const actsBundleScript = escodegen.generate(actsBundleEST);
        
        // await wfPromise( path.join(`${config._rootPath}`, "/stepBundles/actsBundle.js"), actsBundleScript );
        await fsp.writeFile( path.join(`${config._rootPath}`, "/stepBundles/actsBundle.js"), actsBundleScript );

        const factsBundleScript = escodegen.generate(factsBundleEST);
        // await wfPromise( path.join(`${config._rootPath}`, "/stepBundles/factsBundle.js"), factsBundleScript );
        await fsp.writeFile( path.join(`${config._rootPath}`, "/stepBundles/factsBundle.js"), factsBundleScript );
        
        // Sychronoze with new steps build
        syncRsrc.syncSteps();

        return { totalActs: Object.keys(_actSnippets).length, totalFacts: Object.keys(_factSnippets).length };

    } catch (err) {
        return err;
    }
    
};