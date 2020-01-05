'use strict';

/**
 * Custom configuration for handow running, will override the default seeting (_config.js module)
 *
 * @module config
 */

module.exports = {
    // The waiting ms for async operations, e.g. API call, page refreshing ...
    asynctime: 10000,

    // The viewport size, "mobile"==460x720 | "desktop"==1024x768 | "default"==800x600
    viewport: "desktop",

    // Doesn't make sense for fine setting. Just true: shot each act step, false: no screen shot
    screenshot: true,

    // Add cookies info to report or not. true -- will add cookies available for current page path to each act
    cookies: true,

    // Reacting time (ms) after each Act step, default is 300.
    reactTime: 300,

    // Timeout (ms) for waiting element appear/disappear, default is 30000.
    elementAppearTimeout: 10000,

    // Coding and building base directory
    projectPath: "/project",

    storyPath: "/project/stories",

    // Where are your custom steps
    stepsPath: "/project/steps",

    reportPath: "/reports",

    autoArchive: 5,

    consoleOutput: "step",

    outputSkipInfo: true,

    headlessChromium: false,

    newIncognitoContext: false,

    // Timeout (ms) for waiting xhr call response, default is 30000.
    xhrResponseTimeout: 10000,

    globalParams: '/project/params',

    xhrBaseURL: 'https://localhost:8080/api'
};