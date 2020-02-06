'use strict';

const appRoot = require("app-root-path");
const path = require('path');


/**
 * Global parameters for URLs
 */
module.exports = {
    ReportURL: 'https://storage.googleapis.com/handow-uat-assets/static/uat-pet-store/index.html',
    LocalDemoURL: path.join(`${appRoot}`, "demo/demospa/index.html"),
    // LocalReportURL: 'file:///C:/handow/handow-dev/demotarget/index.html'
    Handow_Form: "http://localhost:3000/lab/demoform"
   
};