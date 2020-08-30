'use strict';
/**
 * The record service will record test running info with 3 ways according to config.
 * 1, Outout to console screen
 * 2, Save the result to a JSON file to local machine
 * 3, Send data to a socket server for remote watching
 *
 * @module record
 */
const appRoot = require("app-root-path");
const open = require('open');
const fs = require('fs');
const util = require('util');
const path = require('path');
const glob = require('glob');
const deepExtend = require('deep-extend');
const errParser = require('error-stack-parser');


let config = require('./planConfig').get();

const rfPromise = util.promisify(fs.readFile);
const wfPromise = util.promisify(fs.writeFile);
const cpPromise = util.promisify(fs.copyFile);

const sleep = util.promisify(setTimeout);

let record;

// TODO: The JSON report is not easy for render, need to be re-organized.
/*
    1, Mapping the xxx.json to a new object, which is easy for html rendering.
    2, Actually we also need change the structure of xxx.json when handow create it.
    3, The big isuue is "Do we really need the Given phase??".
    4, We make everything easy if remove Given phase from story.
*/

module.exports = {
    /**
     * @param {objecg} plan - the plan object
     */
    init: (plan) => {
        record = { summary: {}, stages: [] };
        record["title"] = plan.title;
        record["plan"] = plan.plan;
        record.summary["start"] = Date.now();
        if (plan['withSteps']) {
            record.summary["actsBuilt"] = plan['withSteps']['totalActs'];
            record.summary["factsBuilt"] = plan['withSteps']['totalFacts'];
        }
    },

    startStage: (stage) => {
        const _stage = {
            stage: stage.title ? stage.title : `Stage-${record.stages.length}`,
            description: stage.description ? stage.description : `Stage-${record.stages.length}`,
            stories: []
        };
        for ( const sName of stage.stories ) {
            _stage.stories.push( {
                    story: sName,
                    summary: {},
                    given: {}
                    // ^^ whens: []
                } );
        }
        record.stages.push( _stage );
    },

    startStory: (suite) => {
        record.stages[record.stages.length - 1]['stories'].map( (story) => {
            if ( story.story == suite.story || `${story.story}.feature` == suite.story ) {
                story.tags = suite.tags;
                story.summary["start"] = Date.now();
                story.summary["loopStatus"] = [];
                story.given['scenario'] = suite.given.title;
                story.given["loop"] = [];

                for ( const params of suite.given.parameters ) {
                    const _whens = [];
                    // nest whens and looping to all given loop
                    for ( const when of suite.whens ) {
                        const _loop = [];
                        for ( const params of when.parameters ) {
                            _loop.push({
                                parameters: params,
                                acts: [],
                                facts: []
                            });
                        }
                        _whens.push( { scenario: when.title, loop: _loop } );
                    }

                    story.given.loop.push({
                        parameters: params,
                        acts: [],
                        facts: [],
                        whens: _whens       // ^.^, Not like .feature literal, we use nesting structure
                    });
                }
            }
        } );
    },

    endStory: (suite) => {
        record.stages[record.stages.length - 1]['stories'].map( (story) => {
            if ( story.story == suite.story || `${story.story}.feature` == suite.story ) {
                story.summary["end"] = Date.now();
                // Added "Failed" tag if story failed
                if ( story.summary.loopStatus.includes(false) ) {
                    story.tags.push('Failed');
                }
            }
        } );
    },

    /**
     * @param {object} suite - suite object.
     * @param {object} step - step object.
     * @param {string} phase - "given | when".
     * @param {number} gLoop - looping index of current given phase
     * @param {number} widx - only for phase=="when", specify the index of which when phase in whens array
     * @param {number} wLoop - only for phase=="when", specify the looping index of current when phase
     */
    startStep: ( suite, step, phase, gLoop, widx, wLoop ) => {
        record.stages[record.stages.length - 1]['stories'].map( (story) => {
            if ( story.story == suite.story || `${story.story}.feature` == suite.story ) {
                const _step = {
                    title: step.label,  // Here is the original step label, will be replaced with instantiated title
                    status: false,
                    start: Date.now(),
                    type: step.type
                };
                if ( 'given' == phase ) {
                    step.type === 'act' && story.given.loop[gLoop].acts.push(_step);
                    step.type === 'fact' && story.given.loop[gLoop].facts.push(_step);
                } else {
                    // Need handle which is the current given looping
                    step.type === 'act' && story.given.loop[gLoop]['whens'][widx].loop[wLoop].acts.push(_step);
                    step.type === 'fact' && story.given.loop[gLoop]['whens'][widx].loop[wLoop].facts.push(_step);
                }
            }
        } );
    },


    /**
     * @param {object} result - object of result info
     * @param {object} suite - suite object.
     * @param {string} phase - "given | when".
     * @param {number} loop - looping index of current phase
     * @param {object} step - step object
     * @param {number} widx - only for phase=="when", specify the index of which when phase
     * @param {number} gLoop - only for phase=="when", specify the index of current given phase
     */
    endStep: ( result, suite, step, phase, gLoop, widx, wLoop ) => {
        record.stages[record.stages.length - 1]['stories'].map( (story) => {
            const errTraces = [];
            if ( story.story == suite.story || `${story.story}.feature` == suite.story ) {
                // THINKING: actually it is not helpful to show traces of 'stepRunr' and 'suiteRunr'.
                // How ever, the snippet of bundle files can help users trouble shooting.
                // Can we link this to bundle file? IDE triky?
                let _errMsg;
                if ( result.error ) {
                    // Check if error is expect() exception (Jest expect() provide chalk message, can not use it)
                    if ( result.error.matcherResult ) {
                        _errMsg = `Expected \`${result.error.matcherResult.expected}\` but received \`${result.error.matcherResult.actual}\` actually.`;
                    } else {
                        // Remove the \n, \t, \r stuffs, or we got JSON error sometimes. Also remove multi-spaces in line
                        _errMsg = result.error.message ? result.error.message.replace(/\r?\n|\r|\n\t|\t/g, ' ').replace(/\s{2,10}/g, ' ') : null;
                    }

                    const stackFrames = errParser.parse(result.error);
                    for (let i = 0; i < stackFrames.length; i++) {
                        if ( stackFrames[i].fileName.includes(`${__dirname}`)
                            || stackFrames[i].fileName.includes(`${config._rootPath}/stepBundles`) ) {
                            errTraces.push(stackFrames[i].source.trim());
                        }
                    }
                }

                let _steps;
                if ( 'given' == phase && step.type === 'act' ) {
                    _steps = story.given.loop[gLoop].acts;
     
                } else if ( 'given' == phase && step.type === 'fact' ) {
                    _steps = story.given.loop[gLoop].facts;

                } else if ( 'when' == phase && step.type === 'act' ) {
                    _steps = story.given.loop[gLoop]["whens"][widx].loop[wLoop].acts;
        
                } else if ( 'when' == phase && step.type === 'fact' ) {
                    _steps = story.given.loop[gLoop]["whens"][widx].loop[wLoop].facts;
                    
                } else {
                    // console.log(`----------Format-Error: ${phase}`)
                }

                if ( _steps ) {
                    _steps[_steps.length - 1] = {
                        title: result.title,
                        // original label of the step
                        _title: _steps[_steps.length - 1]["title"],
                        start: _steps[_steps.length - 1]["start"],
                        end: Date.now(),
                        status: result.status,
                        screen: result.screen,
                        cookies: result.cookies,
                        xhr: result.xhr,
                        cnslErrors: result.cnslErrors,
                        info: {
                            error: _errMsg,
                            traces: errTraces,
                            errAttachment: result.errAttachment
                        }
                    };
                }
            }
        } );
    },

    /**
     * @param {object} suite - suite object
     * @param {number} suiteLoop - suite looping index
     * @param {boolean} status - status
     */
    setStoryLoopStaus: ( suite, suiteLoop, status ) => {
        record.stages[record.stages.length - 1]['stories'].map( (story) => {
            if ( story.story == suite.story || `${story.story}.feature` == suite.story ) {
                story.summary.loopStatus[suiteLoop] = status;
            }
        } );
    },

    skipPhase: ( suite, widx, gLoop ) => {
        record.stages[record.stages.length - 1]['stories'].map( (story) => {
            if ( story.story == suite.story || `${story.story}.feature` == suite.story ) {
                story.given.loop[gLoop]['whens'].splice(widx, 1, null);   // 2/5/2020, use empty replace skipped phase
                // story.whens[gLoop].splice(widx, 1); // Remove the skipped when-phase completely
            }
        } );
    },

    /**
     * Process the record data to get summary
     *
     * @param {object} data - the record object
     */
    mkSummary: () => {
        let totalStories = 0, passedStories = 0, totalFacts = 0, passedFacts = 0, totalActs = 0, passedActs = 0, totalScenarios = 0, failedScenarios = 0; 
        for ( const stage of record.stages ) {
            for ( const story of stage.stories ) {
                totalStories = totalStories + 1;
                let status = true;
                for ( const sts of story.summary.loopStatus ) {
                    status = status && sts;
                }
                status && passedStories++;

                for ( const loop of story.given.loop ) {
                    totalScenarios = totalScenarios + 1;
                    totalActs = totalActs + loop.acts.length;
                    totalFacts = totalFacts + loop.facts.length;
                    let failedFlag = false;
                    for ( const act of loop.acts ) {
                        // ( act.status === true ) && ( passedActs = passedActs + 1 );
                        act.status && ( passedActs = passedActs + 1 );
                        !act.status && ( failedFlag = true );
                    }

                    for ( const fact of loop.facts ) {
                        // ( fact.status === true ) && ( passedFacts = passedFacts + 1 );
                        fact.status && ( passedFacts = passedFacts + 1 );
                        !fact.status && ( failedFlag = true );
                    }

                    failedFlag && ( failedScenarios = failedScenarios + 1 );

                    for ( const when of loop.whens ) {
                        if (when) {     // skip the skipped phase (it is null)
                            for ( const wLoop of when.loop ) {
                                totalScenarios = totalScenarios + 1;
                                totalActs = totalActs + wLoop.acts.length;
                                totalFacts = totalFacts + wLoop.facts.length;
                                let failedFlag = false;
                                for ( const act of wLoop.acts ) {
                                    // ( act.status === true ) && ( passedActs = passedActs + 1 );
                                    act.status && ( passedActs = passedActs + 1 );
                                    !act.status && ( failedFlag = true );
                                }
    
                                for ( const fact of wLoop.facts ) {
                                    // ( fact.status === true ) && ( passedFacts = passedFacts + 1 );
                                    fact.status && ( passedFacts = passedFacts + 1 );
                                    !fact.status && ( failedFlag = true );
                                }

                                failedFlag && ( failedScenarios = failedScenarios + 1 );
                            }
                        }
                        
                    }
                }
            }
        }

        record.summary['end'] = Date.now();
        record.summary['totalStories'] = totalStories;
        record.summary['passedStories'] = passedStories;
        record.summary['failedStories'] = totalStories - passedStories;
        record.summary['totalSteps'] = totalActs + totalFacts;
        record.summary['passedSteps'] = passedActs + passedFacts;
        record.summary['failedSteps'] = record.summary['totalSteps'] - record.summary['passedSteps'];
        record.summary['totalActs'] = totalActs;
        record.summary['passedActs'] = passedActs;
        record.summary['failedActs'] = totalActs - passedActs;
        record.summary['totalFacts'] = totalFacts;
        record.summary['passedFacts'] = passedFacts;
        record.summary['failedFacts'] = totalFacts - passedFacts;
        record.summary['totalScenarios'] = totalScenarios;
        record.summary['failedScenarios'] = failedScenarios;
    },

    save: async (tree) => {
        let _hdata = null;
        try {
            _hdata = JSON.stringify(record);
            await wfPromise( path.join( config._rootPath, config.reportPath, `${record.plan}_${Date.now()}.json`), _hdata );

            // 0407 save the plan tree object record as "plan.tree" file (json format), which is used by SHM report render
            await wfPromise( path.join( config._rootPath, config.reportPath, 'plan.tree' ), JSON.stringify(tree) );
            
        } catch (e) {
            await wfPromise( path.join( config._rootPath, config.reportPath, `${record.plan}_${Date.now()}.json`), "{}" );
            await wfPromise( path.join( config._rootPath, config.reportPath, 'plan.tree' ), JSON.stringify(null) ); // 0407
        }

        if ( !process.env["LOCAL_RUN"] ) {
            // Here join with current shmSetting, it could be changed in runtime
            try {
                require.resolve(path.join(`${appRoot}`, 'shmSetting.json'));
                const _shmSetting = fs.readFileSync(path.join(`${appRoot}`, 'shmSetting.json'));
                const _shmHdwConfig = JSON.parse(_shmSetting)['hdwConfig'];

                // shm consoleOutput==false means inherit the default configuration
                if (!_shmHdwConfig.consoleOutput) {
                    delete _shmHdwConfig.consoleOutput;
                }
                // For SHM running, shmConfig will override the default config
                config = deepExtend( config, _shmHdwConfig );
            } catch (err) {
                //
            }
        }
        
        if ( config.localRender ) {
            fs.copyFileSync( path.join(__dirname, '/render/dist/main.css'), path.join(config._rootPath, config.reportPath, '/main.css') );
            fs.copyFileSync( path.join(__dirname, '/render/dist/main.js'), path.join(config._rootPath, config.reportPath, '/main.js') );
            let _html = await rfPromise( path.join(__dirname, '/render/dist/render.html'), 'utf8');
            _html = _html.replace('^_json-report_^', _hdata).replace('^_project-title_^', config.projectTitle);
            if ( config._testLocalJSON ) {
                _html = _html.replace('^_json-report-test_^', JSON.stringify(record, null, 2));
            }
            await wfPromise( path.join(config._rootPath, config.reportPath, 'index.html'), _html );
            if ( config.localAutoRender ) {
                // Open local html page render reports
                open( path.join(config._rootPath, config.reportPath, 'index.html') );
            }
        }

        // Local run reset
        process.env["LOCAL_RUN"] = false;
        
    },
    clear: () => {

    },
    archive: () => {

    },
    getSummary: () => {
        return record.summary;
    },
    get: () => {
        return record;
    }
};