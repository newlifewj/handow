'use strict';

/**
 * Convert a story to an object
 *
 * @module parseStory
 */
const eventBus = require('./eventBus');
const line2array = require('./line2arraySync');
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
 * @param {string} _line - A literal step statement line
 * @retrun {objecg} - step object
 */
const parseStepLiteral = (_line) => {
    let line = _line;
    const stepObj = {};
    // an argument map in literal is wrapped as " {...} ", spaces before "{" is mandatory
    const regexp = / \{([^}]+)\}/g;

    const skipIdx = line.indexOf("@skip:");
    if ( skipIdx !== -1 ) {
        const _skipArray = line.split("@skip:");
        if (!_skipArray[1].trim().startsWith('(') || !_skipArray[1].trim().endsWith(")")) {
            throw new TypeError(`Skip condition exression should be enclosed with "()" - ${_skipArray[1].trim()}`);
        }
        stepObj["skip"] = _skipArray[1].trim().slice(1, -1).trim();
        line =  _skipArray[0].trim();
    }

    if ( !line.toLocaleLowerCase().startsWith('given ')
            && !line.toLocaleLowerCase().startsWith('when ')
            && !line.toLocaleLowerCase().startsWith('then ')
            && !line.toLocaleLowerCase().startsWith('and ')
            && !line.toLocaleLowerCase().startsWith('but ')
        ) {
            throw new TypeError(`Not a valid gherkin step - ${line}`);
    } 

    let _pArray;
    const paramsArray = [];
    while ( (_pArray = regexp.exec(line)) !== null ) {
        // Put all "{p: Arg}" to an array 
        paramsArray.push(_pArray[0]);
    }

    stepObj["args"] = stepObj["args"] ? stepObj["args"] : {};

    let _lineTest = line;
    for ( const p of paramsArray ) {
        const kvs = p.trim().slice(1, -1).trim().split(":");
        if ( kvs.length < 2 ) {
            throw new TypeError(`Can not parse arg-param pair - ${p}`);
        } else if ( !kvs[1].trim().startsWith('"') && !kvs[1].trim().startsWith("'")) {
            throw new TypeError(`Can not parse arg-param pair - ${p}`);
        }
        let realArg = kvs[1].trim();
        // The actual argument name could be enclosed with quotes.
        if ( ( realArg.startsWith('"') && realArg.endsWith('"') )
            || ( realArg.startsWith("'") && realArg.endsWith("'") ) ) {
            realArg = realArg.slice(1, -1);
        } else {
            throw new TypeError(`Parameter label should be enclosed with quotes - ${realArg}`);
        }

        stepObj["args"][kvs[0].trim()] = realArg;
        
        line = line.replace(p, ` {${kvs[0].trim()}}`);
        // for test {} is closed or not ...
        _lineTest = _lineTest.replace(p, "");
    }

    if (_lineTest.indexOf("{") !== -1 || _lineTest.indexOf("}") !== -1) {
        throw new TypeError(`Illegal "{" or "}" was found - ${_line}`);
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
 * @param {string} _textObj - an object in text literal (not JSON format), e.g `{a: 'A', b: 'B'}`
 * @return {object} A plain JS object (K-V pairs), e.g. {a: "A", b: "B"}
 */
const parseParameters = (_textObj) => {

    let textObj = _textObj;
    const kvPairs = {};
    textObj = textObj.trim().slice(1, -1).trim();

    // Split k-v pairs by `,`, but ignore the `,` inside quotes
    const kvs = textObj.match( /(?:[^,"']+|"[^"]*"+|'[^']*')+/g );
    if (kvs) {
        for ( let i = 0; i < kvs.length; i++ ) {
            
            const _validTest = kvs[i].split(':');

            // Test the key (_validTest[0]) in parameters valid or not
            try {
                eval( `let ${_validTest[0]} = 0` );     // Get exception if it is illegal identifier.
            } catch (err) {
                throw new TypeError(`Can not parse the key - ${_validTest[0]}`);
            }

            if ( _validTest.length < 2 ) {
                throw new TypeError(`Can not parse parameter pair - ${kvs[i]}`);
            }
            
            // The first ":" is the k-v divider, ignore ":" characters in value.
            const key = kvs[i].slice( 0, kvs[i].indexOf(":") ).trim();
            // The raw value from story literal
            let value = kvs[i].slice( kvs[i].indexOf(":") + 1 ).trim();

            // Validate the parameters key and value
            /*
            if ( !value.trim().startsWith('"')
                && !value.trim().startsWith("'")
                && `${value.trim()}` !== "true"
                && `${value.trim()}` !== "false"
                && isNaN(value.trim()) ) {
                throw new TypeError(`Can not parse arg-param pair - ${kvs[i]}`);
            } else if ( (value.trim().startsWith('"') && !value.trim().endsWith('"'))
                        || (value.trim().startsWith("'") && !value.trim().endsWith("'"))
                        || (!value.trim().startsWith('"') && value.trim().endsWith('"'))
                        || (!value.trim().startsWith("'") && value.trim().endsWith("'")) ) {
                throw new TypeError(`Invalid string type - ${value}`);            
            }  else if ( value.indexOf('@parameters:') !== -1
                        || value.indexOf('@scenario:') !== -1
                        || value.indexOf('@phase:') !== -1 ) {
                throw new TypeError(`Can not parse the value of parameter '${key}'- ${value}`);
            } else {
                // remove substrings in quotes, if the remained string include ":", that means the ',' missed in paremeters
                const _value = value.replace(/"(.*?)"/g, "").replace(/'(.*?)'/g, "");
                if ( _value.indexOf(":") !== -1 ) {
                    throw new TypeError(`No separators before the parameter key - ${_value}`);
                }
            }
            */
           
            // 2021-06-26, added "``" as valid string wrapper
            if ( !value.trim().startsWith('"')
                && !value.trim().startsWith("'")
                && !value.trim().startsWith("`")
                && `${value.trim()}` !== "true"
                && `${value.trim()}` !== "false"
                && isNaN(value.trim()) ) {
                throw new TypeError(`1Can not parse arg-param pair - ${kvs[i]}`);
            } else if ( (value.trim().startsWith('"') && !value.trim().endsWith('"'))
                        || (value.trim().startsWith("'") && !value.trim().endsWith("'"))
                        || (value.trim().startsWith("`") && !value.trim().endsWith("`"))
                        || (!value.trim().startsWith('"') && value.trim().endsWith('"'))
                        || (!value.trim().startsWith("'") && value.trim().endsWith("'")) ) {
                throw new TypeError(`Invalid string type - ${value}`);            
            }  else if ( value.indexOf('@parameters:') !== -1
                        || value.indexOf('@scenario:') !== -1
                        || value.indexOf('@phase:') !== -1 ) {
                throw new TypeError(`2Can not parse the value of parameter '${key}'- ${value}`);
            } else {
                // remove substrings in quotes, if the remained string include ":", that means the ',' missed in paremeters
                const _value = value.replace(/"(.*?)"/g, "").replace(/'(.*?)'/g, "").replace(/`(.*?)`/g, "");
                if ( _value.indexOf(":") !== -1 ) {
                    throw new TypeError(`3No separators before the parameter key - ${_value}`);
                }
            }
            // 2021-06-26, added "``" as valid string wrapper


            // Recover the data type of parameter values, only string, number and bollean supported
            if ( ( value.startsWith('"') && value.endsWith('"') )
                || ( value.startsWith("'") && value.endsWith("'") )
                || ( value.startsWith("`") && value.endsWith("`") ) ) {
    
                value = value.slice(1, -1).trim().toString();
    
            } else if ( `${value}` === "true" || `${value}` === "false" ) {
                value = `${value}` === "true";      // Convert to Boolean
            } else {
                value = Number(value);
            }
            kvPairs[key] = value;
        }
    } else {
        throw new TypeError(`Can not parse parameters block - ${textObj}`);
    }
    
    return kvPairs;
};

/**
 * Convert a literal phase block to a phase object
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
        } else if (
                block[i].startsWith("When")
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
module.exports = (story) => {
    try {
        require.resolve(story);
    } catch (e) {
        // !!!!Force terminate test running, otherwise shmui could be dead locked!!!!!!!
        eventBus.emit('HDW_TEST_FINISHED');

        throw new TypeError(`Story path is not resolved - ${story}`);
    }

    const lines = line2array(story);
/*
    // All story must start with a "Given" step
    if ( lines[0].split(" ")[0] !== "Given" ) {
        throw new TypeError(`Expected story starting with \`Given\`, got \`${lines[0].split(" ")[0]}\``);
    }
*/
    // set story file name - story.
    const storyObj = { story: path.parse(story).base, tags: [] };

    // Chunk story lines to phase blocks
    const phases = [[]];
    let pidx = -1;

    // Extract tags if defined, @tags must be the 1st line of a story.
    if ( lines[0].startsWith("@tags:") ) {
        const tagsLine = lines.shift();
        const tagString = tagsLine.slice(6).trim();
        try {
            const tags = JSON.parse(tagString);
            if ( Array.isArray(tags) && tags.length > 0 ) {
                storyObj['tags'] = tags;
            }
        } catch (err) {
            //
        }
    }

    // Chunk story lines into phase blocks
   for ( let i = 0; i < lines.length; i++) {
        if ( lines[i].startsWith("@scenario:") || lines[i].startsWith("@phase:") ) {
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
        /* } else if ( scenario.startsWith("@scenario") ) {    // ":" after @scenario is optional.
            phaseTitle = scenario.slice(9).trim(); */
        } else if ( scenario.startsWith("@phase:") ) {
            phaseTitle = scenario.slice(7).trim();
        /* } else if ( scenario.startsWith("@phase") ) {
            phaseTitle = scenario.slice(6).trim(); */
        } else {
            throw new TypeError(`Can not parse story - ${story} due to format error`);
        }

        phase = phase.slice(1);

        if (0 === i) {
            const _phaseObj = parsePhaseBlock(phase, "given");
            // _phaseObj["title"] = `${phaseTitle}(phase-${i})`;
            _phaseObj["title"] = `${phaseTitle}`;
            storyObj["given"] = _phaseObj;
        } else {
            const _phaseObj = parsePhaseBlock(phase, "when");
            // _phaseObj["title"] = `${phaseTitle}(phase-${i})`;
            _phaseObj["title"] = `${phaseTitle}`;
            _whens.push( _phaseObj );
        }
        ( _whens.length > 0 ) && ( storyObj["whens"] = _whens );
    }
    // console.log(JSON.stringify(storyObj));
    return storyObj;
};