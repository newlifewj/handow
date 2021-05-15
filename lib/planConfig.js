'use strict';

/**
 * @module planConfig
 * The plan setting shared by this service
 */
const deepExtend = require('deep-extend');
const path = require('path');
const _config = require('./_config.js');
let config;
// config.js at app-root will overriding-merge with default _config if it is exosted.
// When a plan is running, the plan.config will overriding-merge the config again
try {
    require.resolve(path.join(_config._rootPath, 'config.js'));
    config = deepExtend( { ..._config }, require(path.join(_config._rootPath, 'config.js')) );
} catch (e) {
    config = _config;
}

module.exports = {
    set: ( cfg ) => {
        config = cfg;
    },

    get: () => {
        return config;
    }
};