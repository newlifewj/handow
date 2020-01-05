'use strict';

/**
 * Generate EST with templates or reverse operation
 *
 * @module genEST
 */

module.exports = {
    /**
     * The EST tree frame for stepBundle file, more sub-est will be added to it
     */
    stepsBundleFrame: () => {
        return {
            type: "Program",
            body: [
                // EST for: "use strict"
                {
                    type: "ExpressionStatement",
                    expression: {
                        type: "Literal",
                        value: "use strict",
                        raw: "'use strict'"
                    },
                    directive: "use strict"
                },

                // *********** Inset more declarations, e.g. "const fs = rewuire()" *********

                // EST for: "module.exports = { ... }"
                {
                    type: "ExpressionStatement",
                    expression: {
                        type: "AssignmentExpression",
                        operator: "=",
                        left: {
                            type: "MemberExpression",
                            computed: false,
                            object: {
                                type: "Identifier",
                                name: "module"
                            },
                            property: {
                                type: "Identifier",
                                name: "exports"
                            }
                        },
                        right: {
                            type: "ObjectExpression",
                            properties: [

                                // ********** Inset step EST snippet object ***********

                            ]
                        }
                    }
                }
            ],
            sourceType: "script"
        };
    },

    /**
     * Populate one step bundle sub-est
     *
     * @param {object} est - the EST snippet from parsing raw .step.js file.
     * @param {string} label - label of this step
     * @return {object} new EST block (for one step) to populate the stepBundle EST.
     */
    stepBundle: ( est, label ) => {
        // prepair the args elements EST snippet
        const _argsElementsEST = [];
        if ( est.params ) {
            for ( const param of est.params ) {
                _argsElementsEST.push({
                    type: "Literal",
                    value: `${param.name}`,
                    raw: `"${param.name}"`
                });
            }
        }

        return {
            type: "Property",
            key: {
              type: "Literal",
              value: `${label}`,
              raw: `"${label}"`
            },
            computed: false,
            value: {
              type: "ObjectExpression",
              properties: [
                {
                  type: "Property",
                  key: {
                    type: "Identifier",
                    name: "args"
                  },
                  computed: false,
                  value: {
                    type: "ArrayExpression",
                    elements: [..._argsElementsEST]     // Spread already est snippet
                  },
                  kind: "init",
                  method: false,
                  shorthand: false
                },
                {
                  type: "Property",
                  key: {
                    type: "Identifier",
                    name: "doStep"
                  },
                  computed: false,
                  value: est,
                  kind: "init",
                  method: false,
                  shorthand: false
                }
              ]
            },
            kind: "init",
            method: false,
            shorthand: false
        };
    }
};