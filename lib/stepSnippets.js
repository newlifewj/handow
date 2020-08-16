'use strict';

/**
 * Parse Gherkin syntax step file.
 * @module parseStep
 */
const fs = require('fs');
const util = require('util');
// const deepExtend = require('deep-extend');
const esprima = require('esprima');

// const config = deepExtend( require('./_config'), require('../project/config') );

// Convert fs.readFile into Promise
const rfPromise = util.promisify(fs.readFile);

/**
 * Compile a step file and generate a Label-Snippet object.
 *
 * @param {string} steps - path of a steps file, e.g. "./steps/acts.step.js"
 * @return {Promise} the Label-Snippet pair steps object.
 */

module.exports = async (step) => {
    const steps = { acts: {}, facts: {}, variables: [] };
    try {
        const stepsScript = await rfPromise(step, 'utf8');
        const stepsEST = esprima.parseScript(stepsScript);
        // console.log(JSON.stringify(stepsEST));

        stepsEST.body.map( (statement) => {
            // Given/When/Then keyword is mandatory.
            if ( statement.expression
                && statement.expression.callee
                && ( statement.expression.callee.name === "Given"
                    || statement.expression.callee.name === "When"
                    || statement.expression.callee.name === "Then" ) ) {

                // Inject 3 arguments "browser", "page" and "config") into ArrowFunction EST  (Added browser into step context, 2020-08-15)

                statement.expression.arguments[1]["params"].push(
                    {
                        type: "Identifier",
                        name: "browser"
                    }
                );
                statement.expression.arguments[1]["params"].push(
                    {
                        type: "Identifier",
                        name: "page"
                    }
                );
                statement.expression.arguments[1]["params"].push(
                    {
                        type: "Identifier",
                        name: "config"
                    }
                );

                if ( statement.expression.callee.name === "Then" ) {
                    steps["facts"][statement.expression.arguments[0]["value"]]
                        = statement.expression.arguments[1];    // arguments[1]: arrow function "async () => {}"
                } else {
                    steps["acts"][statement.expression.arguments[0]["value"]]
                        = statement.expression.arguments[1];
                }
                // Handle the variable declaration on the top, will join them and add to both step bundle files.
            } else if ( statement.type === "VariableDeclaration" && statement.declarations && statement.declarations.length > 0 ) {
                steps["variables"].push(statement);
            }
        } );
        return steps;
    } catch (e) {
        e.message = `${e.message} (${step})`;
        throw e;
    }
};

/*
    Example:
    --------------------------------------------------------------
    When("I click it {selector}", async (selector) => {
        await page.$eval( selector, (element) => element.click() );
    });
    ---------------------------------------------------------------
    The Label-Snippet will be: "[...]" is the EST snippet block for relevant step script (content in the step function)
    {
        "I click it {selector}" : [
            {
                type: "ExpressionStatement",
                "expression": {
                    ...
                ...
            },
            {
                //
            }
        ],

        "I open ..." : [
            //
        ]
    }
*/

