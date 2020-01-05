'use strict';

/**
 * @module Queue to run a suite on "SUITE_FINISHED" event.
 */

const events = require('events');
const em = new events.EventEmitter();

module.exports = em;