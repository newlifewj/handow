'use strict';

const appRoot = require("app-root-path");

/**
 * Handow built-in configuration, will extend the config.js (if existed) at project root path
 *
 * @module _config
 */

module.exports = {
    // App root path, so that we just need use relative path in project.
    _rootPath: `${appRoot}`,

    // Only for test, render JSON data to html
    _testLocalJSON: false,

    // The waiting ms for async operations, e.g. API call, page refreshing ...
    // asynctime: 10000,       // ?? not use ??

    // Copy current report files to ./archives folder. If history reports are more than 30, then remove the oldest one.
    // autoArchive: 30,
    autoArchive: false,

    // Monitor test output by console: "story" | "step" | "none", "story" is the default.
    consoleOutput: "story",

    // Add cookies info to report or not. true -- will add cookies available for current page path to each act
    cookies: false,

    // Timeout for waiting element appear/disappear, default is 30000.
    elementAppearTimeout: 30000,

    // Enable micro phase syntax
    enablePhaseMicro: false,

    // The path where global parameters are defined, e.g. /project/params/ (relative with app-root).
    globalParams: false,      // default false means "no".

    // Dedault using local real Chrome, but need to be "true" in customconfig or run on Linux ...
    headlessChromium: false,

    // Handle a probe when process parameter selector, default is false, 
    htmlProbe: "h4w",

    // local html render, set up HTML render and relavant resource
    localRender: true,

    // After test finished and store the record, open browser show result automatically.
    localAutoRender: true,

    // Necessary?? - use new incognito context or default browser context, using default by default.
    // This maybe useful for plan setting
    newIncognitoContext: false,

    // Behavior on "no step in lib" for a story step literal.
    undefinedStep: "break",     // "break|continue", defualt "break" will terminate test running immediatelly.

    // Output and record phase/step skipping info, default is false
    outputSkipInfo: false,

    // The tile of local render, format is "projectTitle" - {the plan name}
    projectTitle: "UAT Reports",

    // Reacting time (ms) after some Act steps, e.g. mouse or keybord action.
    // especially for anamation time, default is 0. recommemd to be 300
    reactTime: 0,

    // Report data path (including screenshots). defaut is {rootPath}/reports
    reportPath: "/reports",

    // save record as JSON or not - even false, Handow also save a JSON file, but it's empty
    // saveJsonReport: true, always save json result file.

    // If screen set to boolean false, No Screenshot. Otherwise Handow take screenshot after each act step.
    screenshot: true,

    // Suites number showing in one line for suites running console output
    showSuitesPerLine: 7,

    // Custom steps path, will be overridden by application config or plan config
    stepsPath: '/steps',
    
    // storyfiles path, will be overridden by app config
    storiesPath: '/stories',

    // If screen touched
    touchScreen: false,

    // Viewport could be destop, mobile or set "width x height", default is "800 X 600"
    viewport: "desktop",    // desktop: 1440x800

    // pptr workers - how many browser contexts could be launched for testing suites in paraller
    workers: 4
};
