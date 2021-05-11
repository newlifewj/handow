'use strict';

// const planConfig = require('./planConfig');
const deepExtend = require('deep-extend');
const path = require('path');
// const util = require('util');
const fs = require('fs');
const glob = require('glob');

/**
 * @module get Object for global defined parameters.
 * 
 * @param {string} paramsPath - the full directory path of all global parameters files (*.params.js)
 */

let gParams = {};

module.exports = async ( paramsPath ) => {
    const paramFiles = await glob.sync( path.join( paramsPath, "/*.params.js") );
    
    for ( const file of paramFiles ) {
        // Clear require cache, so that we can update the params if they are edited
        delete require.cache[require.resolve(file)];
        const _prms = require(file);
        gParams = deepExtend( gParams, _prms );
    }

    /*
        The parameters in /local/ are not pushed to remote repository.
        They are used to override global parameters for local machine running
    */
    const localParamFiles = await glob.sync( path.join( paramsPath, "/local/*.params.js") );
    for ( const file of localParamFiles ) {
        // Clear require cache, so that we can update the params if they are edited
        delete require.cache[require.resolve(file)];
        const _prms = require(file);
        gParams = deepExtend( gParams, _prms );
    }

    return gParams;
};