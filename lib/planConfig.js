/* eslint-disable no-use-before-define */
'use strict';

/**
 * @module planConfig
 * The plan setting shared by this service
 */
const deepExtend = require('deep-extend');
const path = require('path');
const _config = require('./_config.js');
let config = mergeConfig();
// config.js at app-root will overriding-merge with default _config if it is existed.
// When a plan is running, the plan.config will overriding-merge the config again


module.exports = {
    set: ( cfg ) => {
        config = cfg;
    },

    get: (global) => {
        if (global) {
            return mergeConfig();
        }
        return config;
    }
};

function mergeConfig() {
    let cfg;
    try {
        require.resolve(path.join(_config._rootPath, 'config.js'));
        cfg = deepExtend( { ..._config }, require(path.join(_config._rootPath, 'config.js')) );
    } catch (e) {
        cfg = deepExtend( { ..._config } );
    }

    return cfg;
}