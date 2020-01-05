'use strict';

/**
 * Story file lines to lineArray.
 * @module line2array
 */

const fs = require('fs');
const util = require('util');

// Convert fs.readFile into Promise function
const readFilePromise = util.promisify(fs.readFile);

/**
 * Convert a story file to string-lines-array, multi-spaces, comment and empty lines are removed
 *
 * @param {string} story - story file path
 * @return {Promise} string array for statement lines of the story
 */
module.exports = async (story) => {
    try {
        const text = await readFilePromise(story, 'utf8');
        if (typeof text !== 'string') {
            throw new TypeError(`Expected story is \`string\`, got \`${typeof text}\``);
        }

        // Create an array for lines, trim each and remove all multi-spaces (including tab)
        const lines = text.split(/\r?\n/).map( (line) => {
            return line.trim().replace(/  +/g, ' ');
        } );

        // Remove all empty lines and comment lines
        return lines.filter( (line) => {
            if ( line !== "" && !line.startsWith("#") ) {
                return true;
            }
            return false;
        } );
    } catch (e) {
        console.log("process feature file error -----------------------");
        console.log(e);
    }
};