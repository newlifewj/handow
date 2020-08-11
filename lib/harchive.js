'use strict';
/**
 * @module archive record and screenshot files to archives/
 *
 * The archive path is './archives' relative with config.reportPath.
 * Each running archive is a folder with same name of the JSON record file, e.g. './archives/myplan_1573585223187/'
 * The maximum archive number is refined by config.autoArchive, e.g. config.autoArchive == 100.
 * Archive happen when plan start running, move current data to the new archive folder.
 * Before move current files to archives, detect if archives more than the maximum limitation.
 * If so, remove the older archives.
 */
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const fsExtra = require('fs-extra');

// const config = deepExtend( require('./_config'), require('../config') );
const config = require('./planConfig').get();

module.exports = () => {
    try {
        const archMax = config.autoArchive === true ? 1000 : config.autoArchive;
        const archs = glob.sync( path.join(config._rootPath, config.reportPath, 'archives/*') );
        let archNumber = 0;
        const archNames = [];
        for ( const arch of archs ) {
            archNames.push(arch);
            archNumber++;
        }
        // Remove expired history archives (remove multiple folders)
        if ( archNumber >= archMax ) {
            archNames.sort( ( a, b ) => {
                return ( a.substring(a.lastIndexOf("_") + 1) - b.substring(b.lastIndexOf("_") + 1) );
            } );
            const oldArchs = archNames.slice( 0, archNames.length - archMax + 1 );
            for ( const arch of oldArchs ) {
                fsExtra.removeSync(arch);
            }
        }

        const jPlanFiles = glob.sync( path.join(config._rootPath, config.reportPath, '*.json') );
        const _planFile = path.basename(jPlanFiles[0]).slice(0, -5);

        // get all files of the latest record under "/report/" directly
        const _archs = glob.sync( path.join(config._rootPath, config.reportPath, '*.*') );

        if ( !fs.existsSync( path.join(config._rootPath, config.reportPath, `/archives/${_planFile}`) ) ) {
            fs.mkdirSync( path.join(config._rootPath, config.reportPath, `/archives/${_planFile}`) );

            // const _archs = glob.sync( path.join(config._rootPath, config.reportPath, '*.*') );
            for ( const _arch of _archs ) {
                const _fName = path.basename(_arch);
                fsExtra.moveSync( _arch, path.join(config._rootPath, config.reportPath, `/archives/${_planFile}/${_fName}`), { overwrite: true });
            }
        }

        // Anyway, we need remove all the records of current latest, unless they are conflict the new records. Silently if they are removed already
        for ( const _arch of _archs ) {
            fsExtra.moveSync( _arch );
        }

        return _planFile;   // Return the new archived record path
    } catch (e) {
        return false;    
    }
};
