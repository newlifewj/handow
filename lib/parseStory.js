'use strict';

/**
 * Convert a story to an object
 *
 * @module parseStory
 */

const line2array = require('./line2array');
const deepExtend = require('deep-extend');
// const config = deepExtend( require('./_config'), require('../config') );
const config = require('./planConfig').get();
const path = require('path');

/**
 * Private function to convert a literal step statement to an object
 *
 * @example:
 * statement line: "And I fill input {input: \"UsernameInputBox\"} with text {text: \"AdminUsername\"} @skip=\"LoginRole==='ADMIN_ROLE'\""
 * paesrStepLiteral(literal):
 * {
 *  skip: "LoginRole!=='ADMIN_ROLE'",
 *  label: I fill input {input} with text {text},
 *  gherkin: "And"
 *  args: { input: "UsernameInputBox", text: "AdminUsername" }
 * }
 *
 * @param {string} line - A literal step statement line
 * @retrun {objecg} - step object
 */
const parseStepLiteral = (line) => {
    const stepObj = {};
    // an argument map in literal is wrapped as " {...} ", spaces before "{" is mandatory
    const regexp = / \{([^}]+)\}/g;

    const skipIdx = line.indexOf("@skip:");
    if ( skipIdx !== -1 ) {
        const _skipArray = line.split("@skip:");
        stepObj["skip"] = _skipArray[1].trim().slice(1, -1).trim();
        line =  _skipArray[0].trim();
    }

    let _pArray;
    const paramsArray = [];
    while ( (_pArray = regexp.exec(line)) !== null ) {
        // Put all "{p: Arg}" to an array 
        paramsArray.push(_pArray[0]);
    }

    stepObj["args"] = stepObj["args"] ? stepObj["args"] : {};
    for ( const p of paramsArray ) {
        const kvs = p.trim().slice(1, -1).trim().split(":");
        let realArg = kvs[1].trim();
        // The actual argument name could be enclosed with quotes or not.
        if ( ( realArg.startsWith('"') && realArg.endsWith('"') )
            || ( realArg.startsWith("'") && realArg.endsWith("'") ) ) {
            realArg = realArg.slice(1, -1);
        }

        stepObj["args"][kvs[0].trim()] = realArg;

        line = line.replace(p, ` {${kvs[0].trim()}}`);
    }

    // Separate first Gherkin key and following label
    stepObj["label"] = line.trim().slice(line.indexOf(' ')).trim();
    stepObj["gherkin"] = line.slice(0, line.indexOf(' ')).trim();  // First word is the Gherkin key

    return stepObj;
};

/**
 * Convert literal object inline to a JS object, only support plain K-V pairs.
 * It is used to parse parameters of a phase block
 *
 * @param {string} textObj - an object in text literal (not JSON format), e.g `{a: 'A', b: 'B'}`
 * @return {object} A plain JS object (K-V pairs), e.g. {a: "A", b: "B"}
 */
const parseParameters = (textObj) => {

    const kvPairs = {};
    textObj = textObj.trim().slice(1, -1).trim();

    // Split k-v pairs by `,`, but ignore the `,` inside quotes
    const kvs = textObj.match( /(?:[^,"']+|"[^"]*"+|'[^']*')+/g );
    if (kvs) {
        for ( let i = 0; i < kvs.length; i++ ) {
            // The first ":" is the k-v divider, ignore ":" characters in value.
            const key = kvs[i].slice( 0, kvs[i].indexOf(":") ).trim();
            // The raw value from story literal
            let value = kvs[i].slice( kvs[i].indexOf(":") + 1 ).trim();
    
            // Recover the data type of parameter values, only string, number and bollean supported
            if ( ( value.startsWith('"') && value.endsWith('"') )
                || ( value.startsWith("'") && value.endsWith("'") ) ) {
    
                value = value.slice(1, -1).trim().toString();
    
            } else if ( value == "true" || value == "false" ) {
                value = value == "true";
            } else {
                value = Number(value);
            }
            kvPairs[key] = value;
        }
    }
    
    return kvPairs;
};

/**
 * Convert a literal phase block to pahse object
 *
 * @param {string[]} block - multi-lines phase literal block
 * @return {object} phase object
 */
const parsePhaseBlock = ( block, pName ) => {
    let actAndBut = false;
    let factAndBut = false;
    const params = [];

    const phase = { acts: [], facts: [], phase: pName };

    for ( let i = 0; i < block.length; i++ ) {
        if ( i === 0 && block[i].startsWith("@skip:") ) {
            // Add skip field if @skip specified on the top of phase block
            phase["skip"] = block[i].slice(6).trim().slice(1, -1).trim();
        } else if ( block[i].startsWith("When")
                || block[i].startsWith("Given")
                || ( actAndBut &&  ( block[i].startsWith("And") || block[i].startsWith("But") ) )
            ) {

            actAndBut = true;
            factAndBut = false;

            // TODO: Verify if the step existed in stepsBundle. If not existed, set a dummy step which is handled by runner
            // And also output to console

            const _step = parseStepLiteral( block[i] );
            _step["type"] = "act";
            phase.acts.push(_step);

        } else if ( block[i].startsWith("Then")
                || ( factAndBut &&  ( block[i].startsWith("And") || block[i].startsWith("But") ) )
            ) {

            actAndBut = false;
            factAndBut = true;

            // TODO: Verify if the step existed in stepsBundle. If not existed, set a dummy step which is handled by runner
            // And also output to console

            const _step = parseStepLiteral( block[i] );
            _step["type"] = "fact";
            phase.facts.push(_step);

        } else if ( block[i].startsWith("@parameters:") ) {
            let _param = "";

            /*
                Join multi paramter line items in one string for parsing easily. E.g.:
                [ "{", "a: \"A\"", "}" ] to [ "{a:\"A\"}" ]
            */
            for ( let j = i; j < block.length; j++ ) {
                _param += block[j];
            }
            _param = _param.slice(12).trim();   // Remove the "@parameters:" head stuff

            // Handle objects array and single pararenters object, both of them work.
            if ( _param.startsWith("{") && _param.endsWith("}") ) {
                params.push( parseParameters(_param) );
            } else if ( _param.startsWith("[") && _param.endsWith("]") ) {

                _param = _param.slice(1, -1).trim();

                // chunk param object literals into array, separated with "}," or "} ,", but should keep "}"
                const _paramArray = _param.replace(/} ?,/g, "}},").split("},");

                for ( let p = 0; p < _paramArray.length; p++ ) {
                    params.push( parseParameters(_paramArray[p].trim()) );
                }
            } else {
                throw new TypeError(`Expected parameters are wrapped in "{}", but got "${_param.charAt(0)}...${_param.charAt(_param.length - 1)}"`);
            }
            // Block lines finished at finishing parameters (if patameters existed)
            break;
        } else {
            throw new TypeError(`Expected statements starting with legal keywords, got "${block[i].slice(0, 4)}..."`);
        }
    }

    phase["parameters"] = params.length > 0 ? params : [{}];
    phase["loops"] = params.length;

    return phase;
};

/**
 * Module method to generate a story object according to the literal story file
 *
 * @param {string} story - path of a story file
 * @return {Promise} object generated for the story
 */
module.exports = async (story) => {
    const lines = await line2array(story);
    try {
        require.resolve(story);
    } catch (e) {
        throw new TypeError(`Story path is not resolved - ${story}`);
    }
/*
    // All story must start with a "Given" step
    if ( lines[0].split(" ")[0] !== "Given" ) {
        throw new TypeError(`Expected story starting with \`Given\`, got \`${lines[0].split(" ")[0]}\``);
    }
*/
    // set story file name - story.
    const storyObj = { story: path.parse(story).base };

    // Chunk story lines to phase blocks
    const phases = [[]];
    let pidx = -1;

    // Chunk story lines into phase blocks
   for ( let i = 0; i < lines.length; i++) {
        if ( lines[i].startsWith("@scenario") || lines[i].startsWith("@phase") ) {
            pidx++;
            phases[pidx] = [];
            phases[pidx].push(lines[i]);
        } else {
            phases[pidx].push(lines[i]);
        }
    }
    // Convert chunk blocks story object
    const _whens = [];
    for ( let i = 0; i < phases.length; i++ ) {
        let phase = phases[i];
        let phaseTitle;
        const scenario = phases[i][0];    // scenario is the phase title

        if ( scenario.startsWith("@scenario:") ) {
            phaseTitle = scenario.slice(10).trim();
        } else if ( scenario.startsWith("@scenario") ) {    // ":" after @scenario is optional.
            phaseTitle = scenario.slice(9).trim();
        } else if ( scenario.startsWith("@phase:") ) {
            phaseTitle = scenario.slice(7).trim();
        } else if ( scenario.startsWith("@phase") ) {
            phaseTitle = scenario.slice(6).trim();
        } else {
            throw new TypeError(`Can not parse story - ${story} due to format error`);
        }

        phase = phase.slice(1);

        if (0 === i) {
            const _phaseObj = parsePhaseBlock(phase, "given");
            _phaseObj["title"] = `${phaseTitle}(phase-${i})`;
            storyObj["given"] = _phaseObj;
        } else {
            const _phaseObj = parsePhaseBlock(phase, "when");
            _phaseObj["title"] = `${phaseTitle}(phase-${i})`;
            _whens.push( _phaseObj );
        }
        ( _whens.length > 0 ) && ( storyObj["whens"] = _whens );
    }
    // console.log(JSON.stringify(storyObj));
    return storyObj;
};