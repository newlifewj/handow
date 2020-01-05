'use strict';

/**
 * @module herrorParse
 */

const errParser = require('error-stack-parser');

/**
 * Parse Error to simplify the trace stack (Don't want see error stack including unnecessary traces )
 *
 * @param {object} error - Node.js Error instance.
 * @param {string} path - optional, traces path awared for the error.
 * @return {object} Error instance.
 */

module.exports = ( error, path ) => {
    // e.message = `${e.message}`;
    const stackFrames = errParser.parse(error);
    // Parse the error stack, only keep traces related with specific path
    for (let i = 0; i < stackFrames.length; i++) {
        if ( !path || stackFrames[i].fileName.includes(path) ) {
            error.message += `\n\t${stackFrames[i].source}`;
        }
    }
    // Add a line spacer after total message lines
    error.message = `${error.message}\n`;
    return error;
};