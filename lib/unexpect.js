'use strict';

const util = require('util');
const eventBus = require('./eventBus.js');
const sleep = util.promisify(setTimeout);
const config = require('./planConfig').get();

module.exports = async (msg) => {
    if (`${config.runningException}` === 'break' ) {
        eventBus.emit('HDW_TEST_FINISHED');
        console.error(new TypeError(`${msg}`));
        await sleep(300);
        // THINKING: process.exit() will stop everything, then we need restart the SHM. Is it required?
        process.exit();     // Stop running when the step is not existing in current steps bundle.
    } else {
        console.error(new TypeError(`${msg}`));
        await sleep(10000);
        eventBus.emit('HDW_TEST_FINISHED');
    }
};