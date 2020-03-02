
'use strict';

/** ******************************************************************
 * Built plan tree for SHM accessing
 * *******************************************************************/
const appRoot = require("app-root-path");
const fs = require('fs');
const util = require('util');
const path = require('path');
const glob = require('glob');
const _ = require('lodash');

const planRunr = require('./planRunr');
const parseStory = require('./parseStory');
const getGlobalParams = require('./globalParams');
const config = require('./planConfig').get();

let globalParams = {};

/**
 * 
 * @param {string} label - the original step label, e.g. "When I click it {selector}"
 * @param {object} args - the argument k-v pairs of a this step (args in this label), e.g. { selector: "Submit_Button" }
 * @param {object} params - The params lookup table, e.g { ..., Submit_Button: "#submit-button", ... }
 * 
 * @return {string} - the label has been populated with parameters, e.g. "When I click Submit_Button (#submit-button)"
 */
const instLabel = (label, args, _params) => {

    const params = { ...globalParams, ..._params };     // spreading and extending

    let title = label;
    // E.g. str = "a {b} c", regexp.exec(str) -> ["{b}", "b"] 
    const regexp = / \{([^}]+)\}/g;
    let result = regexp.exec(label);
    
    // Split literal and variables, replace step argument with actual param name
    while ( result ) {
        // Break the literal to 2 parts by the 1st matching " {...}"
        const _strArray = title.split(result[0]);

        // extract argument form " {...}" wrapping
        const arg = result[1].trim();

        // replace argument-pronoun name with parameter name, e.g. the "it" of "I click it {selector}
        const literal = `${_strArray[0].slice(0, _strArray[0].lastIndexOf(" "))} ${args[arg]}`;

        // populate title with parateter value available in current story data
        title = `${literal} <pre name="_param-value_">(${params[args[arg]]})</pre>`;

        // Continue process the remain literal, looping to resolve all arguments
        if ( _strArray[1] && _strArray[1].trim() !== '' ) {
            title = `${title} ${_strArray[1].trim()}`;
            result = regexp.exec(title);
        } else {
            break;
        }
    }
    return title;
};

/**
 * Transform story object to a story branch for planTree (refactor structure and populate with parameters - including global params)
 * {
 *      name: ""
 *      story: [
 *          {
 *              given: { acts: [], facts: [] },      // the given scenario node
 *              whens: [
 *                  [
 *                      { acts: [], facts: [] },
 *                      { acts: [],                 // the when scenarios looping nodes are expaned too
 *                  ]
 * 
 *              ]       // all when scenario nodes
 *          },
 *          {
 *              given:      // the story level loops (if existed) are expanded into flat array
 *          }
 *      ]
 * }
 * 
 * @param {object} story - the story object from parsing a feature file (same as the storyObj in handow-core)
 */
const transformStoryObj = (name, storyObj) => {
    
    const storyLine = { name: `${name}`, story: [] };

    let gParams;    // Story parameters
    if ( !Array.isArray(storyObj.given.parameters) ) {
        gParams = [storyObj.given.parameters];
    } else {
        gParams = storyObj.given.parameters;
    }

    const gActs = storyObj.given.acts ? storyObj.given.acts : [];
    const gFacts = storyObj.given.facts ? storyObj.given.facts : [];
    for ( const gp of gParams ) {
        const _gActs = [];
        for ( const ga of gActs ) {
            _gActs.push({ label: instLabel(ga.label, ga.args, gp), status: "ready" });
        }

        const _gFacts = [];
        for ( const gf of gFacts ) {
            _gFacts.push({ label: instLabel(gf.label, gf.args, gp), status: "ready" });
        }

        const _whens = [];
        for ( const when of storyObj.whens ) {
            let wParams;
            if ( !Array.isArray(when.parameters) ) {
                wParams = [when.parameters];
            } else {
                wParams = when.parameters;
            }

            const wActs = when.acts ? when.acts : [];
            const wFacts = when.facts ? when.facts : [];

            const _ws = [];   // Expand a when scenarion with parameters looping
            for ( const wp of wParams ) {
                const _wActs = [];
                for ( const wa of wActs ) {
                    _wActs.push({ label: instLabel(wa.label, wa.args, { ...gp, ...wp }), status: "ready" });
                }

                const _wFacts = [];
                for ( const wf of wFacts ) {
                    _wFacts.push({ label: instLabel(wf.label, wf.args, { ...gp, ...wp }), status: "ready" });
                }
                _ws.push({ acts: _wActs, facts: _wFacts });
            }

            _whens.push(_ws);
        }

        storyLine.story.push({ given: { acts: _gActs, facts: _gFacts }, whens: _whens });
    }

    return storyLine;
};

/**
 * Generate a planTree for specific file path (plan or story), and save the tree file (*.tree.json) sibling as plan (or story).
 * Can not generate a planTree if the plan is auto created to wrap multiple stories. 
 * 
 * @param {string} plan - a plan object
 * 
 * @return {Promise} - the tree json data, and the tree.json file has been created/updated
 */
module.exports = async (plan) => {
    let _params = {};
    // SHM could ask to build plan tree without running, handow don't allowd that when test is running to avoid blocking test.
    if (planRunr.isRunning()) {
        return null;    // No tree file generated and persisted
    }

    // The config obect for this plan
    const _cfg = { ...config, ...plan.config };

    // Global parameters for current plan
    if ( _cfg['globalParams'] ) {
        globalParams = await getGlobalParams(path.join(_cfg._rootPath, _cfg['globalParams']));
    }

    let _storySet = [];
    let _stageSet = [];
    for ( const stg of plan.stages ) {
        _stageSet.push(stg.stage);
        _storySet = _.union(_storySet, stg.stories);
    }

    // plan tree template
    const _plan = {
        title: `${plan.title}`,
        stages: [],
        config: plan.config ? plan.config : null,
        summary: {
            title: `${plan.title}`,
            stageSet: _stageSet,
            storySet: _storySet 
        }
    };

    // "await" in for-loop is okay if no nexting promise or callback
    for ( const stg of plan.stages ) {
        const _stage = { stage: stg.stage, description: stg.description, stories: [] };

        for ( const story of stg.stories ) {
            try {
                const _storyObj = parseStory( path.join(`${_cfg._rootPath}`, `${_cfg.storiesPath}`, `${story}.feature`) );
                _storyObj["story"] = `${story}`;
                
                const _story = transformStoryObj(`${story}`, _storyObj);

                _stage.stories.push(_story);
            } catch (err) {
                //
            }
        }
        _plan.stages.push(_stage);
    }
    return _plan;
};