'use strict';

let res = null;

/**
* @param {object} _data - scenario result data (steps specific)
*/
const message = (_data) => {
    res && res.write( `data: ${JSON.stringify({ type: "data", data: _data })}\n\n` );
};

/**
 * @param {object} _res - the SSE connection response object, SHM pass it to handow and then handow can write to SSE stream
 */
const init = (_res) => {    // SHM call init() to pass sse connection to handow, updated when any new EventSource instance created
    res = _res;
};

/**
 * @module - Service to access SSE endpoint defined in SHM
 */
module.exports = {
    message: message,
    init: init
};
