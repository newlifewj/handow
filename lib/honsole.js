'use strict';

/**
 * Output to console, including suite running progress and result
 *
 * @module houtput
 */
const tmnl = require( 'terminal-kit' ).terminal;
const logSymbols = require('log-symbols');
const _ = require('lodash');

const record = require('./record');
const config = require('./planConfig').get();

let progressBar, sLines, progressInterval;
// let totalSteps = 1;

/**
 * Refresh suites status showing on console
 *
 * @param {object[]} suites - suite array are running in parallel (with status attribute).
 */
const refreshSuitesStatus = ( suites ) => {

        // chunk suites to 2-demension array to show suites in muliple lines
        const _ss = _.chunk( suites, config.showSuitesPerLine );
        sLines = _ss.length;

        for ( let i = 0; i < _ss.length; i++ ) {
            const _suites = _ss[i];
            tmnl.bgDefaultColor('  ');

            for ( let j = 0; j < _suites.length; j++ ) {
                // Remove the file extension, e.g. .feature
                const name = _suites[j].story.slice(0, _suites[j].story.lastIndexOf("."));

                // Different styles suite name for different status: run, success, failed, pending(default)
                if ( _suites[j].status === "run" ) {
                    tmnl.inverse(`${name}`);
                } else if ( _suites[j].status === "success" ) {
                    tmnl.green(`${name}`);
                } else if (  _suites[j].status === "failed" ) {
                    tmnl.brightRed(`${name}`);
                } else {
                    tmnl(`${name}`);
                }

                // Handle line wrapping
                if ( j === _suites.length - 1 ) {
                    tmnl('\n');
                } else {
                    tmnl('  ');
                }
            }
        }
};

module.exports = {
    /**
     * Start running multiple suites, show the stage title, suites with status and progress bar
     *
     * @param {object | object[]} suites - an array of suite object or a single suite object
     * @param {string} stage - optional, title of the stage for current suites
     */
    runSuites: ( suites, stage ) => {
        if ( config.consoleOutput !== 'step' && config.consoleOutput !== 'none' ) {
            clearInterval(progressInterval);
            // Output the title of current group testing
            if ( Array.isArray(suites) ) {
                const stageTitle = stage ? `"${stage}"` : "suites";
                tmnl('\n  ').underline(`| Run ${stageTitle} (${suites.length} stories) |`)('\n\n');
            } else {
                tmnl('\n  ').underline(`| Run test suite of a story |`)('\n\n');
            }

            // Update (rerender) the suites list with status styles
            refreshSuitesStatus(suites);
            tmnl('\n');

            // Show the progress bar
            progressBar = tmnl.progressBar( {
                width: 100,
                title: `Steps running: `,
                eta: true,
                // barBracketStyle: tmnl.bold,
                barStyle: tmnl.green,
                percent: true
            } );
            tmnl('\n');
            // Trigger progress bar initialization and show it
            progressBar.update(0.001);
            let count = 0;
            progressInterval = setInterval( () => {
                count += Math.random() / ((20 * suites.length) + ( 40 * count ));
                if (count > 0.9) {
                    count = 0.3;
                }
                progressBar.update(count);
            }, 1000 );
        }
    },

    /**
     * return the progress bar reference.
     */
    progressBar: () => {
        if ( config.consoleOutput !== 'step' && config.consoleOutput !== 'none' ) {
            return progressBar;
        }
    },

    /**
     *
     */
    clearProgress: () => {
        if ( config.consoleOutput !== 'step' && config.consoleOutput !== 'none' ) {
            clearInterval(progressInterval);
        }
    },

    /**
     * Once a suite finished, the suite-status list is updated
     *
     * @param (@param {object | object[]} suites - an array of suite object or a single suite object)
     */
    updateSuitesInfo: (suites) => {
        if ( config.consoleOutput !== 'step' && config.consoleOutput !== 'none' ) {
            // Move cursor from below the progress bar to begin of the suite-status list.
            tmnl.up(sLines + 2);

            // Rerender suite-status list
            refreshSuitesStatus(suites);

            // Then move cursor back to below the progress bar
            tmnl.down(2);
        }
    },

    /**
     * Run the progress bar ( by the ratio of finishedSteps/totalSteps )
     *
     * @param {number} progress - 0-1 decimal number, "1" means 100%.
     */
    setProgress: (progress) => {
        if ( config.consoleOutput !== 'step' && config.consoleOutput !== 'none' ) {
         progressBar.update( progress );
        }
    },

    /**
     * Show testing result to console after all parallei running suites finished
     *
     * @param {object} record - the record object of the finished plan.
     */
    showResult: () => {
        const d = record.getSummary();
        const _value = [
            d.passedStories, d.passedSteps, d.passedActs, d.passedFacts,
            d.failedStories, d.failedSteps, d.failedActs, d.failedFacts,
            d.totalStories, d.totalSteps, d.totalActs, d.totalFacts
        ];

        const values = _value.map( (v) => {
            if ( v < 10 ) {
                return `   ${v}`;
            } else if ( v < 100 ) {
                return `  ${v}`;
            } else if ( v < 1000 ) {
                return ` ${v}`;
            } else {
                return `${v}`;
            }
        } );

        const minutes = Math.floor( ( d.end - d.start ) / 60000);
        const seconds = ((( d.end - d.start ) % 60000) / 1000).toFixed(0);

        tmnl('\n');
        tmnl(`  ${d.totalStories} stories with ${minutes} minutes and ${seconds} seconds.\n`);
        tmnl('  ----------------------------------------------------------\n');
        tmnl('  |          | stories |  steps  | actions | verifications |\n');
        tmnl('  |----------|---------|---------|---------|---------------|\n');
        tmnl('  |   ').green('passed')(' |    ').green(`${values[0]}`)(' |    ').green(`${values[1]}`)(' |    ').green(`${values[2]}`)(' |          ').green(`${values[3]}`)(' |\n');
        tmnl('  |----------|---------|---------|---------|---------------|\n');
        tmnl('  |   ').red('failed')(' |    ').red(`${values[4]}`)(' |    ').red(`${values[5]}`)(' |    ').red(`${values[6]}`)(' |          ').red(`${values[7]}`)(' |\n');
        tmnl('  |----------|---------|---------|---------|---------------|\n');
        tmnl(`  |    total |    ${values[8]} |    ${values[9]} |    ${values[10]} |          ${values[11]} |\n`);
        tmnl('  ----------------------------------------------------------\n');
        // tmnl('Render record summary of each suite .......................\n');
        // tmnl('Optionally, present all errors of each story .......................\n');
    },

    /**
     * Output 2 line warning info on the top at begin
     */
    startWarning: () => {
        tmnl.inverse.brightYellow('\n Warning:').underline(' Keep console screen wide enough and do not resize the window in test running ... ').inverse.brightYellow(' Wrap? \n');
        tmnl.inverse.brightYellow('\n Notice:').underline(' Mouse focus on screen will pause working flow, right-click or enter ESC to continue ... ').inverse.brightYellow(' \n\n');
    },

    cliHelp: () => {
        // u+0009, Tab unicode
        tmnl("Usage (by node):\u0009\u0009").brightCyan("[path]> ")("node [handow-path] --[task] --[target-path]\n");
        tmnl("Usage (by shell):\u0009\u0009").brightCyan("[path]> ")("handow --[task] --[target-path]\n\n");
        tmnl("--[task]\u0009\u0009\u0009").green("--plan\u0009\u0009")("Run specific plan, followed by a plan path\n");
        tmnl("\u0009\u0009\u0009\u0009").green("--story\u0009\u0009")("Run specific story, followed by '.feature' story path\n");
        tmnl("\u0009\u0009\u0009\u0009").green("--parsestory\u0009")("Parse story or stories to suite(s), followed by stories directory or '.feature' story path\n");
        tmnl("\u0009\u0009\u0009\u0009").green("--buildstep\u0009")("Build steps by specific custom step path, followed by custom steps path\n");
        tmnl("\u0009\u0009\u0009\u0009").green("--help\u0009\u0009")("Show CLI help, default task\n\n");
        tmnl("--[target-path]\u0009\u0009\u0009Target path relative with app root if target required for the task\n\n");
        tmnl("Examples:\u0009\u0009\u0009").brightCyan("[path]/core> ").green("node ./handow --plan --/project/testPlan\n");
        tmnl("\u0009\u0009\u0009\u0009").brightCyan("[path]> ").green("handow --story --/project/stories/example.feature\n");

    },

    cliStarting: (scenario) => {
        tmnl.brightGreen(`Handow start running @${scenario} ...\n`);
    },

    clear: () => {
        tmnl.clear();
    },

    success: (msg) => {
        tmnl.bold(`${logSymbols.success} `)(`${msg}\n`);
    },
    error: (msg) => {
        tmnl.bold(`${logSymbols.error} `)(`${msg}\n`);
    },
    warning: (msg) => {
        tmnl.bold(`${logSymbols.warning} `)(`${msg}\n`);
    },
    info: (msg) => {
        tmnl.bold(`${logSymbols.info} `)(`${msg}\n`);
    },
    downArrow: (msg) => {
        tmnl.cyan(`\u2193 `)(`${msg}\n`);
    },
    upArrow: (msg) => {
        tmnl.cyan(`\u2191 `)(`${msg}\n`);
    },
    leftArrow: (msg) => {
        tmnl.cyan(`\u2190 `)(`${msg}\n`);
    },
    rightArrow: (msg) => {
        tmnl.cyan(`\u2192 `)(`${msg}\n`);
    },
    pending: (msg) => {
        tmnl.bold.brightMagenta(`- `)(`${msg}\n`);
    },

    wrapBlock: (type, text, loopCount) => {
        if ( config.consoleOutput === 'step' ) {
            if ( "given" === type) {
                if ( loopCount && loopCount > 1 ) {
                    tmnl.colorRgb(80, 240, 100).inverse(` [Story]=${text} - loop ${loopCount} times ====`)('\n');
                } else if (text) {
                    tmnl.colorRgb(80, 240, 120).inverse(` [Story]=${text}`)('\n');
                } else {
                    tmnl.colorRgb(80, 240, 120).inverse(` ====`)('\n');
                }
            } else if ( "when" === type ) {
                if ( loopCount && loopCount > 1 ) {
                    tmnl.colorRgb(200, 160, 120).inverse(` [Phase] with ${text} steps - loop ${loopCount} times ----`)('\n');
                } else if (text) {
                    tmnl.colorRgb(200, 160, 120).inverse(` [Phase] with ${text} steps`)('\n');
                } else {
                    tmnl.colorRgb(200, 160, 120).inverse(` ----`)('\n');
                }
            } else {
                // console.log( chalk`{inverse.rgb(80,240,120) ${text}}` );
                tmnl.colorRgb(80, 240, 120).inverse(`${text}\n`);
            }
        }
    },

    /**
     * Output phase or step skip message with "skip ... due-to ..." syntax ('due-to' keyword is optional)
     *
     * @param {object} obj - skip block, a step or phase object
     * @param {string} type - 'step' | 'phase'
     */
    showSkip: (obj, type) => {
        let skipInfo, skipDueTo;
        if ( type === 'step' ) {
            const step = obj;
            skipInfo = step.label;
            const regexp = / \{([^}]+)\}/g;

            // Process label by replacing step arguments with actual parameter names
            let result = regexp.exec(skipInfo);
            while ( result ) {
                const arg = result[0].trim().slice(1, -1).trim();
                skipInfo = skipInfo.replace( result[0].trim(), `<${step.args[arg]}>`);
                result = regexp.exec(skipInfo);
            }
            skipDueTo = step.skip;

        } else if ( type === 'phase' ) {
            const phase = obj;
            const steps = phase["acts"].length + phase["facts"].length;

            skipInfo = `From "${phase.acts[0].gherkin} ${phase.acts[0].label}"`;
            const regexp = / \{([^}]+)\}/g;

            // Process label by replacing step arguments with actual parameter names
            let result = regexp.exec(skipInfo);
            while ( result ) {
                const arg = result[0].trim().slice(1, -1).trim();
                skipInfo = skipInfo.replace( result[0].trim(), `<${phase["acts"][0].args[arg]}>`);
                result = regexp.exec(skipInfo);
            }

            skipInfo = `${skipInfo} ... (${steps} steps)`;
            skipDueTo = phase.skip;

        } else {
            // do nothing
        }

        tmnl.colorRgb(250, 240, 250).inverse('-').colorRgb(250, 240, 250)(' [').defaultColor(`skip-${type}`).colorRgb(250, 240, 250)(']').defaultColor(` ${skipInfo}\n`)
                    .colorRgb(250, 240, 250)('  [').defaultColor('due-to').colorRgb(250, 240, 250)('] ').defaultColor(` ${skipDueTo}\n`);
    }

};

/*
    Because we want run mulitple stories in parallel, that make it imporaaible to outpt message step by step.
    It is hard to arrange steps with suites and showing meaningful information. It is not so important to
    watch test running from console, and we will deploy a server to output the real running info by websocket.
*/