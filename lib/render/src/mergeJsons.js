/**
 * pre-build, merge *.en.json and *.fr.json files to i18n/en.jsons and i18n.fr.json.
 * Then webpack build will load the merged json into bundle.js.
 * Webpack only load the merged result json file.
 * Run merge-json, en.json or fr.json changing will update webpack server sync
 */

const fs = require('fs');
const glob = require('glob');

let output = {};

glob('src/**/*.en.json', (error, files) => {
    files.forEach( (filename) => {
        const contents = JSON.parse(fs.readFileSync(filename, 'utf8'));
        Object.assign(output, contents);
    } );
    fs.writeFileSync('src/i18n/en.json', JSON.stringify(output));
} );

output = {};
glob('src/**/*.fr.json', (error, files) => {
    files.forEach( (filename) => {
        const contents = JSON.parse(fs.readFileSync(filename, 'utf8'));
        Object.assign(output, contents);
    } );
    fs.writeFileSync('src/i18n/fr.json', JSON.stringify(output));
} );