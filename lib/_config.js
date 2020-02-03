'use strict';

const appRoot = require("app-root-path");
const path = require('path');

/**
 * Handow built-in configuration, will extend the config.js (if existed) at project root path
 *
 * @module _config
 */

module.exports = {
    // The waiting ms for async operations, e.g. API call, page refreshing ...
    asynctime: 10000,       // ?? not use ??

    // Dedault using local real Chrome, but need to be "true" in customconfig or run on Linux ...
    headlessChromium: false,

    // If screen set to boolean false, No Screenshot. Otherwise Handow take screenshot after each act step.
    screenshot: true,

    // Add cookies info to report or not. true -- will add cookies available for current page path to each act
    cookies: false,

    // Reacting time (ms) after each Act step, default is 300.
    reactTime: 300,

    // Timeout for waiting element appear/disappear, default is 30000.
    elementAppearTimeout: 30000,

    // Output and record phase/step skipping info, default is false
    outputSkipInfo: false,

    // Monitor test output by console: "story" | "step" | "none", "story" is the default.
    consoleOutput: "story",

    // App root path, so that we just need use relative path in project.
    _rootPath: `${appRoot}`,

    // Custom steps path, will be overridden by application config or plan config
    stepsPath: '/steps',
    
    // storyfiles path, will be overridden by app config
    storiesPath: '/stories',

    // Report data path (including screenshots). defaut is {rootPath}/reports
    reportPath: "/reports",

    // Suites number showing in one line for suites running console output
    showSuitesPerLine: 7,

    // Copy current report files to ./archives folder. If history reports are more than 30, then remove the oldest one.
    // autoArchive: 30,
    autoArchive: false,

    // pptr workers - how many browser contexts could be launched for testing suites in paraller
    workers: 4,

    // Viewport could be destop, mobile or set "width x height", default is "800 X 600"
    viewport: "desktop",    // desktop: 1440x800

    // If screen touched
    touchScreen: false,

    // Necessary?? - use new incognito context or default browser context, using default by default.
    // This maybe useful for plan setting
    newIncognitoContext: false,

    // Enable micro phase syntax
    enablePhaseMicro: false,

    // save record as JSON or not - even false, Handow also save a JSON file, but it's empty

    saveJsonReport: true,

    // local html render, set up HTML render and relavant resource
    localRender: true,

    // After test finished and store the record, open browser show result automatically.

    localAutoRender: true,

    // Only for test, render JSON data to html
    _testLocalJSON: false,

    // The tile of local render, format is "projectTitle" - {the plan name}
    projectTitle: "UAT Reports",

    // Handle a probe when process parameter selector, default is false, 
    htmlProbe: "h4w",

    // The path where global parameters are defined, e.g. /project/params/ (relative with app-root).
    globalParams: false,      // default false means "no".

    xhrBaseURL: "/"
};

/*
    Config parameters are required by most Handow modules.
    They are defined in the built-in _config and project custom config.js file (optionally).
    const config = deepExtends( _config, config );      // Custom config will override the default _config.
*/