'use strict';

const appRoot = require("app-root-path");

/**
 * Handow test engine built-in configuration, will extend the config.js (if existed at main project root path)
 *
 * @module _config
 */

module.exports = {
    // App root path.
    _rootPath: `${appRoot}`,

    // Thinking: What is it? necessary??
    // Only for test, render JSON data to html
    _testLocalJSON: false,

    // Wait all XHR resolved after each action step or not, default is true - resolve all XHR after each action before taking screenshot. 
    handlePendingXHR: true,

    // Copy current report files to ./archives folder. the oldest one is removed if archives number more than that. false means 'No archives'
    autoArchive: false,

    // Browser session scope, 'plan' - all stories in the plan share same browser session; "story" - each story launch new browser context
    browserSessionScope: "plan",

    // Monitor test output by console: "story" | "step" | "none", "story" is the default.
    consoleOutput: "story",

    // Add cookies info to report or not. true -- will add cookies available for current page path to each act
    cookies: false,

    // If no timeout specificed, Playwright APIs will implement this timeout
    defaultTimeout: 30000,

    // Timeout for waiting element appear, default is 30000.
    elementAppearTimeout: 10000,

    // Timeout for verify element nonexistent, default is 10000.
    elementDisappearTimeout: 10000,

    // ToDo - Enable micro phase syntax, 
    // enablePhaseMicro: false,

    // Path of the global parameters files (relative with app-root).
    globalParams: 'project/params',      // globalParams===false means "no".

    // Using headless browser or not, it is forced to 'true' if Handow is running on Linux OS
    headless: true,

    // Handle probe syntax when process parameter selector, false means No Probe, 
    htmlProbe: "h4w",       // default Probe name is "h4w"

    // local html render, set up HTML render and relavant resource
    localRender: true,

    // After test finished and store the record, open browser show result automatically.
    localAutoRender: true,

    // Timeout for browser navigating complete, e.g. the document is loading
    navigatingTimeout: 3000,

    // Output and record phase/step skipping info, default is false
    outputSkipInfo: false,

    // Add errors happened currently to report or not. true -- Will add errors existed in current page to each act
    pageErrors: false,

    // Test project root, defaut is {rootPath}/project
    projectPath: "project",

    // The tile of local render, format is "projectTitle" - {the plan name}
    projectTitle: "UAT Reports",

    // The APIs of Playwright for current running, "chromium" | "firefox" | "webkit"
    pwtAPI: "chromium",

    // Reacting time (ms) after each Act steps but before taking screenshot
    reactTime: 300,

    // Report data path (including screenshots). defaut is {rootPath}/project/records
    reportPath: "project/records",

    // Handow take screenshot after each act step, or not.
    screenshot: true,

    // Suites number showing in one line for suites running console output, only for console output
    showSuitesPerLine: 7,

    // Custom steps path, will be overridden by application config or plan config, defaut is {rootPath}/project/steps
    stepsPath: 'project/steps',
    
    // storyfiles path, will be overridden by app config, defaut is {rootPath}/project/stories
    storiesPath: 'project/stories',

    // If screen touched
    touchScreen: false,

    // Behavior on "no step in lib" ... like those running exceptions.
    runningException: "continue",     // "break|continue", defualt "break" will terminate test running immediatelly.

    // Viewport could be destop, mobile or set "width x height", default is "800 X 600"
    viewport: "desktop",    // desktop: 1440x800

    // how many pages could be opened to test different stories in paraller
    workers: 3
};
