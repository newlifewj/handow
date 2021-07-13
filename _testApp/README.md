The handow test engine is a Node.js module. It should be install into a main application when developers run and debug the handow project source code in local machine. Scaffold the main test application basing on *_testApp/* with 3 steps:

## Copy/Paste content of *_testApp/*

Create a folder, e.g., **mainApp**, sibling with the **handow** project, copy content of *_testApp/* and paste them to *mainApp/*. Then install dependencies (they ).

## Install local handow project as module and other dependencies

In _package.json_, we can see the **handow** folder is specified local resource module. (Other dependencies are requireded for NPM runner and the generated stepBundles)

```json
{
    "dependencies": {
        "handow": "file:../handow"
    },
    "devDependencies": {
        "concurrently": "^6.0.1",
        "cross-env": "^7.0.3",
        "deep-extend": "^0.6.0",
        "expect": "^26.6.2",
        "lodash": "^4.17.21",
        "nodemon": "^2.0.4",
        "open": "^7.0.0"
    }
}
```

Then install dependencies:

```bash
/mainApp/ $ npm install
```

## Add symbolic-links 

Add symbolic-links to make handow accessing the main application, assuming the absolute path of the main test app is _"C:\\test\\mainApp\\"_

```bash
/handow/ $ mklink /D "project" "C:/test/mainApp/project"
/handow/ $ mklink /D "stepBundles" "C:/test/mainApp/stepBundles"
/handow/ $ mklink "config.js" "C:/test/mainApp/config.js"
```

## Verify handow under _mainApp/_

```bash
# Run handow to see the Help Info
$ npm run handow

# Build steps, then verify the generated bundle files in "stepBundles/"
$ npm run buildSteps

# Parse story, them verify the generated story object - "project/stories/TestStory.json"
$ npm run parseStory

# Run a story
$ npm run TestStory

# Run a plan
$ npm run TestPlan
```