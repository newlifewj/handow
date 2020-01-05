'use strict';

const config = require('../../core/planConfig').get();
const path = require('path');


/**
 * Global parameters for URLs
 */

module.exports = {
    ReportURL: 'https://storage.googleapis.com/handow-uat-assets/static/uat-pet-store/index.html',
    LocalDemoURL: `${path.join(config._rootPath, 'demotarget/index.html')}`
    // LocalReportURL: 'file:///C:/handow/handow-dev/demotarget/index.html'
   
};