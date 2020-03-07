'use strict';

/**
 * Dev test storyRunr run a story object
 */
const https = require('https');
const handow = require('../lib/_handow');
const appRoot = require("app-root-path");
const path = require('path');
const httpAgent = require('axios').create({
    httpsAgent: new https.Agent({  
      rejectUnauthorized: false
    })
});


( async () => {
    try {
        // process.env["_HDW_STOP_"] = true;
        const resp =  await httpAgent.request({
            url: "/info",
            baseURL: "http://localhost:3333/api",
            method: "GET"
        });
        console.log(JSON.stringify(resp.body, null, 4));
        if ( resp.status == '200' && resp.data && resp.data.isRunning) {
            return;
        } else if ( resp.status == '200' && resp.data && !resp.data.isRunning ) {
            // Passed nativeRunPid to SHM
            const resp =  await httpAgent.request({
                url: "/system/nativerunpid",
                baseURL: "http://localhost:3333/api",
                method: "POST",
                data: {
                    pid: process.pid
                }
            });
            
            if (resp.status != '200') {
                return;
            }
        } else {
            console.log("Can not access SHM");
            return;
        }

        handow.runPlan( path.join(`${appRoot}`, 'demo/project/demo.plan.json') );
       // console.log(`--------------${process.execPath} --- ${process.pid}`);
        // handow.stop();
    } catch (e) {
        console.log(`----${e.message}`);
    }
} )();