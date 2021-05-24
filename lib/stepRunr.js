'use strict';

/**
 * Step runner.
 * @module stepRunr
 */

const deepExtend = require('deep-extend');
const path = require('path');
const herrorParse = require('./herrorParse');
const cnsl = require('./honsole');
const syncRsrc = require('./syncResource');

// const config = deepExtend( require('./_config'), require('../config') );
const config = require('./planConfig').get();
/* 4/23
// The stepsBundle files maybe removed due to some reasons, must handle this situation.
let actsBundle, factsBundle;
try {
    actsBundle = require( path.join(config._rootPath, '/stepBundles/actsBundle') );
} catch (e) {
    console.error('No action bundles available to run steps');
    actsBundle = {};
}

try {
    factsBundle = require( path.join(config._rootPath, '/stepBundles/factsBundle') );
} catch (e) {
    console.error('No fact bundles available to run steps');
    factsBundle = {};
}
*/
const isNth = (v) => {
    const pattern = new RegExp(/^[1-9]*$/g);
    return ( pattern.test(v) && v.length === 1 );
};

/**
 * Private funtion to handle parameters using "Handow Probe Syntax".
 * The probe format is [probe-string]@[probe-name]("[contains]", nth). // contains and nth are optional
 * Example for 'selector' and 'xpath' (assuming probe is "h4w"):
 * "prifile-title@h4w" --> "*[h4w=prifile-title]" or "//*[@h4w='prifile-title']"
 * "prifile-title@h4w(3)"   --> "*[h4w=prifile-title]:nth-child(3)" or "(//*[@h4w='prifile-title'])[3]" ! number starts from 1
 * "prifile-title@h4w('3')"   --> invalid for selector, xpath: "//*[@h4w='prifile-title' and contains(., '3')]"
 * "prifile-title@h4w('3',3)"   --> invalid for selector, xpath: "(//*[@h4w='prifile-title' and contains(., '3')])[3]"
 * 
 * @param {string} key - the parameter key
 * @param {string} value - the parameter value
 * @return {string} the translated parameter value if it is a "Probe Selector", pass through if not identified legally
 * 
 * !!Note: Can not use probe syntax in global parameter files
 */
const parseProbe = (key, value) => {
    let _v;

    if ( value.endsWith(`@${config.htmlProbe}`) ) {
        // e.g. "account-search@h4w"
        if ( key === 'selector' ) {
            // convert to attribute selector "*[h4w=account-search]"
            _v = value.replace(`@${config.htmlProbe}`, '');
            _v = `*[${config.htmlProbe}=${_v}]`;
        } else if ( key.trim() === 'xpath' ) {
            // convert to xpath "//*[@h4w='account-search']"
            _v = value.replace(`@${config.htmlProbe}`, '');
            _v = `//*[@${config.htmlProbe}='${_v}']`;
        } else {
            _v = value;
        }

    } else if ( value.startsWith(`@${config.htmlProbe}`) ) {
        return value;   // pass through if start with @probe

    } else {
        // e.g.  "account-search@h4w..."
        const _vParts = value.split(`@${config.htmlProbe}`);
        if (_vParts.length !== 2 ) {
            return value;   // ignore multi @h4w cases

        } else if ( _vParts[1].trim().startsWith("(") && _vParts[1].trim().endsWith(")") ) {
            // e.g. "account-search@h4w(...)"
            const args = _vParts[1].trim().slice(1, -1).trim().split(",");
            if ( args.length === 1 ) {
                if ( !isNth(args[0]) && key === 'xpath') {
                    _v = `//*[@${config.htmlProbe}='${_vParts[0]}' and contains(., ${args[0]})]`;
                } else if ( isNth(args[0]) && key === 'xpath' ) {
                    _v = `(//*[@${config.htmlProbe}='${_vParts[0]}'])[${args[0]}]`;
                } else if ( isNth(args[0]) && key === 'selector' ) {
                    _v = `*[${config.htmlProbe}=${_vParts[0]}]:nth-child(${args[0]})`;
                } else {
                    return value;
                }
            } else if ( args.length === 2 && key == 'xpath' ) {
                _v = `(//*[@${config.htmlProbe}='${_vParts[0]}' and contains(., ${args[0]})])[${args[1]}]`;
            } else {
                return value;
            }

        } else if (_vParts[1].trim().startsWith("//")) {
            // e.g. "account-search@h4w//button", convert to xpath "//*[@h4w='account-search']//button"
            _v = `//*[@${config.htmlProbe}='${_vParts[0].trim()}']${_vParts[1].trim()}`;
        } else {
            return value;
        }
    }
    return _v;
};


/**
 * Private function to convert step label to report title
 * Example:
 *      "When I enter input {input} with text {text}"
 * ---> to instantiated info title
 *      `When I enter UsernameInput <"#username-input"> with AdminName <"Admin User">`
 * 1, arguments are instantiated: '{input}' and '{text}' are replaced with <"#username-input"> and <"Admin User">
 * 2, argument-pronoun names are instantiated: 'input' and 'text' are replaced with 'UsernameInput' and 'AdminName'
 *
 * @param {string} label - the label with arguments.
 * @param {object} args - step arguments and pamareter names mapping object.
 * @param {object} sdata - current parameter values
 *
 * @return {string} Instantiated string title
 */
function instantLabel (label, args, sdata) {

    let title = label;

    // match " {...}" string pattern - test the {parameter} in the step label
    const regexp = / \{([^}]+)\}/g;

    let result = regexp.exec(label);

    // Split literal and variables, replace step argument with actual param name
    while ( result ) {
        // Break the literal to 2 parts by the 1st matching " {...}", so the _strArray is the literal before the " {...}"
        const _strArray = title.split(result[0]);

        // extract argument form " {...}" wrapping
        const arg = result[0].trim().slice(1, -1).trim();

        // replace argument-pronoun name with parameter name, e.g. the "it" of "I click it {selector}
        // const literal = `${_strArray[0].slice(0, _strArray[0].lastIndexOf(" "))} ${args[arg]}`;      /* No pronoun now! 2021-04-22 */

        const literal = `${_strArray[0]} <pre name="_param-name_">${args[arg]}</pre>`;

        // populate title with parateter value available in current story data
        title = `${literal} <pre name="_param-value_">(${sdata[args[arg]]})</pre>`;

        // Continue process the remain literal, looping to resolve all arguments
        if ( _strArray[1] && _strArray[1].trim() !== '' ) {
            title = `${title} ${_strArray[1].trim()}`;
            result = regexp.exec(title);
        } else {
            break;
        }
    }
    return title;
}


/**
 * Find out a step and run it on current page with current story data mapping
 *
 * @param {object} stepObj - a step object
 * @param {object} sdata - a K-V pair object for all valid parameters, including all global params, story params and params in this scenario of current loop
 * @param {objec} page - current working pptr page
 * @param {objec} browser - current working pptr browser // 2020-08-15, added browser to step running context
 *
 * @return {Promise} the result object.
 */
module.exports = async ( stepObj, sdata, browser, page, config ) => {

    const stepInfoTitle = instantLabel(`${stepObj.gherkin} ${stepObj.label}`, stepObj.args, sdata);
    page.errAttachment = undefined;

    try {
        const actsBundle = syncRsrc.getActsBundle();
        const factsBundle = syncRsrc.getFactsBundle();

        // get the step object by label matching
        const step = "act" === stepObj.type ? actsBundle[stepObj.label] : factsBundle[stepObj.label];

        if ( step == 'undefined' && config.undefinedStep !== 'continue' ) {
            // Stop running when the step is not existing in current steps bundle.
            console.error(new TypeError(`Can not parse parameters block - ${stepObj.label}`));
            process.exit();
        }

        const argValues = [];

        // stepObj["args"] is arg-paramName mapping, could be in wrong order. Must obey argument order of step
        if ( stepObj["args"] && step["args"] ) {
            for ( const argument of step["args"] ) {
                // Instant arguments on current story data - except the injected arguments (browser, page and config)
                if ( argument !== "browser" && argument !== "page" && argument !== "config" ) {
                    let _value = sdata[stepObj["args"][argument]];

                    // Parse possible probe syntax for 'selector' and 'xpath'
                    if ( config.htmlProbe && typeof _value === 'string' && _value.length > 5
                        && _value.indexOf(`@${config.htmlProbe}`) !== -1
                        && ( argument === 'selector' || argument === 'xpath' ) ) {
                            _value = parseProbe( argument, _value );
                    }
                    // argValues.push( sdata[stepObj["args"][argument]] );
                    argValues.push( _value );
                }
            }
        }
        // Run the step ..., act and fact failures are exceptions and handled by catch(e)

        await step.doStep( ...argValues, browser, page, config );
        // --------------------------- honsole ------------------------------------------------
        if ( config.consoleOutput === "step" ) {
            stepObj.type === "act" && config.consoleOutput && cnsl.downArrow(`${stepInfoTitle}`);
            stepObj.type === "fact" && config.consoleOutput && cnsl.success(`${stepInfoTitle}`);
        }
        // -------------------------------------------------------------------------------------

        return {
            title: stepInfoTitle,
            status: true,
            error: null
        };

    } catch (e) {
        const error = herrorParse(e, path.join(config._rootPath, '/stepBundles'));

        // --------------------------- honsole ------------------------------------------------
        if ( config.consoleOutput === "step" ) {
            stepObj.type === "fact" && config.consoleOutput && cnsl.error(`${stepInfoTitle}`);
            stepObj.type === "act" && config.consoleOutput && cnsl.pending(`${stepInfoTitle}`);

            cnsl.error(error.message);
        }
        // ------------------------------------------------------------------------------------

        return {
            title: stepInfoTitle,
            status: false,
            error: e,
            errAttachment: page.errAttachment 
        };
    }
};