'use strict';

/** *****************************************************************************
 * syncResource is a repository provide file resource, e.g. stepBundles, params ...
 * 
 * When handow is a module of SHM server implementation, it is initialized one time
 * at the server starting. The files included by "require" operation will not keep synchronous
 * with file changing because they are sssigned to variables when modules instantiated.
 * The syncResource factory provide API to update these resources by read the files again.
 * 
 * Example, the stepBundles are included as contants. They are not synchronized with the bundle files
 * if we don't update them. Then the test running can not use the new changed steps.
 * ******************************************************************************/

const path = require('path');

const config = require('./planConfig').get();

let actsBundle;
let factsBundle;

const syncSteps = () => {
    try {
        delete require.cache[require.resolve(path.join(config._rootPath, '/stepBundles/actsBundle'))];
        actsBundle = require( path.join(config._rootPath, '/stepBundles/actsBundle') );
    } catch (e) {
        // console.error('No action bundles available to run steps');
        actsBundle = {};
    }
    
    try {
        delete require.cache[require.resolve(path.join(config._rootPath, '/stepBundles/factsBundle'))];
        factsBundle = require( path.join(config._rootPath, '/stepBundles/factsBundle') );
    } catch (e) {
        // console.error('No fact bundles available to run steps');
        factsBundle = {};
    }
};

syncSteps();

module.exports = {
    syncSteps: syncSteps,
    getActsBundle: () => actsBundle,
    getFactsBundle: () => factsBundle
};