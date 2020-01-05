'use strict';

/**
 * @module planConfig
 * The plan seting shared by this service
 */
const deepExtend = require('deep-extend');
// Default is _config overriden by custom config, but it is overriden again by plan.config at plan starting
let _config = deepExtend( require('./_config'), require('../config') );

module.exports = {
    set: ( cfg ) => {
        _config = cfg;
    },

    get: () => {
        return _config;
    }
};