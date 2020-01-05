'use strict';

// const planConfig = require('./planConfig');
const deepExtend = require('deep-extend');
const path = require('path');
// const util = require('util');
// const fs = require('fs');
const glob = require('glob');

/**
 * @module Object for global defined parameters.
 */

let gParams = { aaa: "AAA" };

module.exports = async ( paramsPath ) => {
    const paramFiles = await glob.sync( path.join( paramsPath, "/*.params.js") );
    
    for ( const file of paramFiles ) {
        const _prms = require(file);
        gParams = deepExtend( gParams, _prms );
    }
    return gParams;
};