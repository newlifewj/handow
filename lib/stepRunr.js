'use strict';

/**
 * Step Runner
 * @module stepRunr Run a step - which is an object
 * @description Module with single function as default export, which will run a step, either an act or a fact.
 */

const path = require('path');
const util = require('util');
const herrorParse = require('./herrorParse');
const cnsl = require('./honsole');
const syncRsrc = require('./syncResource');
const config = require('./planConfig').get();
const oops = require('./unexpect.js');

/*
    Test if a string is [1-9] digital
*/
const isNth = (v) => {
    const pattern = new RegExp(/^[1-9]*$/g);
    return ( pattern.test(v) && v.length === 1 );
};

/**
 * @function parseProbe Handle step arguments using "Handow Probe Syntax", convert them to valid CSS selectors or Xpaths
 * @param {string} key - the parameter key
 * @param {string} value - the parameter value
 * @return {string} the translated parameter value if it is a "Probe-Locator", pass through if not identified legally
 * 
 * @description The probe format is [probe-string]@[probe-name]("[contains]", nth). // contains and nth are optional
 * Example for 'selector' and 'xpath' (assuming probe is "h4w"):
 * "prifile-name@h4w" --> "*[h4w=prifile-name]" or "//*[@h4w='prifile-name']"
 * "prifile-name@h4w(3)"   --> "*[h4w=prifile-name]:nth-child(3)" or "(//*[@h4w='prifile-name'])[3]" ! number starts from 1
 * "prifile-name@h4w('3')"   --> invalid for selector, xpath: "//*[@h4w='prifile-name' and contains(., '3')]"
 * "prifile-name@h4w('3',3)"   --> invalid for selector, xpath: "(//*[@h4w='prifile-name' and contains(., '3')])[3]"
 * 
 * !Note: Probes only exist in pahse parameters, cannot be used in global parameter files
 */
const parseProbe = (key, value) => {
    let _v;

    if ( value.startsWith(`@${config.htmlProbe}`) ) {
        return value;   // pass through if start with @probe - invalid probe

    /*
        Simple probe, e.g. "probe-name@h4w"
    */
    } else if ( value.endsWith(`@${config.htmlProbe}`) ) {
        if ( key === 'selector' ) {              // convert to "//*[@h4w='probe-name']"
            _v = value.replace(`@${config.htmlProbe}`, '');
            _v = `//*[@${config.htmlProbe}='${_v}']`;
        } else {
            _v = value;     // go through if it isn't a 'selector'
        }
    /*
        Probe with content, order specifications or as xpath scope, e.g. "probe-name@h4w(...)" or "probe-name@h4w//..."
    */
    } else {
        const _vParts = value.split(`@${config.htmlProbe}`);
        if (_vParts.length !== 2 ) {
            return value;   // ignore multi @h4w cases - invalid probe
        /*
            probe pattern is "probe-name@h4w(...)"
        */
        } else if ( _vParts[1].trim().startsWith("(") && _vParts[1].trim().endsWith(")") ) {
            const args = _vParts[1].trim().slice(1, -1).trim().split(",");
            if ( args.length === 1 ) {
                if ( !isNth(args[0]) && key === 'selector') {
                    /* "probe-name@h4w('text')" to xpath "//*[@h4w='prifile-name' and contains(., 'text')]" */
                   // _v = `//*[@${config.htmlProbe}='${_vParts[0]}' and contains(., ${args[0]})]`; // 2021-07-10, make value contains valid
                   _v = `//*[@${config.htmlProbe}='${_vParts[0]}' and (contains(., ${args[0]}) or contains(@value, ${args[0]}))]`;

                } else if ( isNth(args[0]) && key === 'selector' ) {
                    /* "probe-name@h4w(5)" to xpath "(//*[@h4w='prifile-name'])[5]", the nth number starts from 1 */
                    _v = `(//*[@${config.htmlProbe}='${_vParts[0]}'])[${args[0]}]`;

                } else {
                    return value;
                }
            } else if ( args.length === 2 && key === 'selector' ) {
                /* "probe-name@h4w('text', 5)" to xpath "(//*[@h4w='prifile-name' and contains(., 'text')])[5]" */
                // _v = `(//*[@${config.htmlProbe}='${_vParts[0]}' and contains(., ${args[0]})])[${args[1]}]`;  // 2021-07-10, make value contains valid
                _v = `(//*[@${config.htmlProbe}='${_vParts[0]}' and (contains(., ${args[0]}) or contains(@value, ${args[0]}))])[${args[1]}]`;
                
            } else {
                return value;
            }
        /*
            probe pattern is "probe-name@h4w//..."
        */
        } else if (_vParts[1].trim().startsWith("//")) {
            /* "probe-name@h4w//button" to xpath "//*[@h4w='probe-name']//button" */
            _v = `//*[@${config.htmlProbe}='${_vParts[0].trim()}']${_vParts[1].trim()}`;
        } else {
            return value;
        }
    }
    return _v;
};


/**
 * @function instantLabel Private function to convert step label to report title
 * @param {string} label - the label with arguments.
 * @param {object} args - step arguments and pamareter names mapping object.
 * @param {object} sdata - current parameter values
 * @return {string} Instantiated string title
 * @description Example:
 *      "When I enter input {input} with text {text}"
 * ---> to instantiated info title
 *      `When I enter UsernameInput <"#username-input"> with AdminName <"Admin User">`
 * 1, arguments are instantiated: '{input}' and '{text}' are replaced with <"#username-input"> and <"Admin User">
 * 2, argument-pronoun names are instantiated: 'input' and 'text' are replaced with 'UsernameInput' and 'AdminName'
 */
function instantLabel (label, args, sdata) {

    let title = label;

    /* match " {...}" string pattern - test the {parameter} in the step label */
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
 * @exports stepRunr default export function as plan runner
 * @param {object} stepObj - a step object
 * @param {object} sdata - a K-V pair object for all valid parameters, including all global params, story params and params in this scenario of current loop
 * @param {objec} page - current working pptr page
 * @param {objec} browser - current working browser context
 * @return {Promise} the result object.
 * @description Find out a step and run it on current page with current story data mapping
 */
module.exports = async ( stepObj, sdata, page, config ) => {

    const stepInfoTitle = instantLabel(`${stepObj.gherkin} ${stepObj.label}`, stepObj.args, sdata);
    page.errAttachment = undefined;     // Some errors are attached to page in step running

    try {
        /*
            Obtain the step bundles synchronous with new updating, then get the target step
        */
        const actsBundle = syncRsrc.getActsBundle();
        const factsBundle = syncRsrc.getFactsBundle();
        const step = "act" === stepObj.type ? actsBundle[stepObj.label] : factsBundle[stepObj.label];

        if (`${step}` === 'undefined') {
            await oops(`The step is invalid or undefined - ${stepObj.label}`);
        }

        const argValues = [];

        /*
            stepObj["args"] is arg-paramName mapping, could be in wrong order. Make them obey argument order of step
        */
        if ( stepObj["args"] && step["args"] ) {
            for ( const argument of step["args"] ) {
                /*
                    Instant arguments on current story data - except the injected arguments (browser, page and config)
                */
                if ( argument !== "browser" && argument !== "page" && argument !== "config" ) {
                    let _value = sdata[stepObj["args"][argument]];

                    /*
                        Parse possible probe syntax for 'selector' and 'xpath'
                    */
                    if ( config.htmlProbe && typeof _value === 'string' && _value.length > 5
                        && _value.indexOf(`@${config.htmlProbe}`) !== -1
                        && ( argument === 'selector' ) ) {
                            _value = parseProbe( argument, _value );
                    }
                    argValues.push( _value );
                }
            }
        }
 
        /*
            Run the step ..., failures are threw as exceptions and handled by catch(e)
            The argument 'browser' of doStep() is browser context actually
        */
        await step.doStep( ...argValues, page.context(), page, config );

        /* ---------- honsole story output ---------- */
        if ( config.consoleOutput === "step" ) {
            stepObj.type === "act" && config.consoleOutput && cnsl.downArrow(`${stepInfoTitle}`);
            stepObj.type === "fact" && config.consoleOutput && cnsl.success(`${stepInfoTitle}`);
        }

        /*
            Step finished success, return the _result object
        */
        return {
            title: stepInfoTitle,
            status: true,
            error: null
        };

    } catch (e) {
        /*
            The failures in step running are threw as exception and handled here 
        */
        const error = herrorParse(e, path.join(config._rootPath, '/stepBundles'));

        /* ---------- honsole story output ---------- */
        if ( config.consoleOutput === "step" ) {
            stepObj.type === "fact" && config.consoleOutput && cnsl.error(`${stepInfoTitle}`);
            stepObj.type === "act" && config.consoleOutput && cnsl.pending(`${stepInfoTitle}`);

            cnsl.error(error.message);
        }

        /*
            Step finished failed, return the _result object
        */
        return {
            title: stepInfoTitle,
            status: false,
            error: e,
            errAttachment: page.errAttachment 
        };
    }
};