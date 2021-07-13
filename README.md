Handow is an E2E test engine basing on [Playwright Node.js APIs](https://playwright.dev/docs/intro/). Users can integrate it with **handow-shm** to scaffold a full featured test server, or run the test engine solely with CLI. Test developers can also import **handow** to Node.js application as APIs provider.

![#f03c15](https://via.placeholder.com/15/f03c15/000000?text=+) Highly recommended to clone the [handow-seed](https://github.com/newlifewj/handow-seed) to scaffold your test project if you are **Handow users**.

> **Who are handow users?** The Handow users just want to import **handow** as a module package in their E2E applications. The **handow-seed** project is a good chice for Handow users create their test application quickly. If you prefer creating custom project and invoke Handow APIs by script or CLI, please refer [Handow APIs And Commands](https://github.com/newlifewj/handow/wiki/Handow-APIs-And-Commands).

## Features

+ Driven by **Playwright APIs** 
+ Simplified Gherkin syntax for test story
+ Built-in steps library and custom steps integration
+ Parameters passing from scenarios and params files
+ Static report generation
+ Multi-workers for parallel running

Refer [Handow Outline](https://github.com/newlifewj/handow/wiki/Handow-Outline) to see more details.

## Install

Make sure [Node.js](https://nodejs.org/en/download/) has been installed to your local machine, versions **">=12.0.0 && <15.0.0"** are recommended).

```
$ npm install
```

Handow test engine is not a stand alone application. In order to run and debug the local handow project as a Node.js module, it should be installed to a main test application. The _"/\_testApp/"_ folder in **handow** source code is a simple test project, developers can use it as main application.
[Install local handow project to main test](https://github.com/newlifewj/handow/tree/master/_testApp)

## Resources

[Documentation](https://github.com/newlifewj/handow/wiki)

The seed project to implement Handow on Github [handow](https://github.com/newlifewj/handow-seed)

The Handow test server repository on NPM [handow-shm](https://www.npmjs.com/package/handow-shm)

The Handow engin repository on NPM [handow](https://www.npmjs.com/package/handow)

## License

MIT

