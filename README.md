Handow is an E2E test engine basing on [Playwright Node.js APIs](https://playwright.dev/docs/intro/). Users can integrate it with **handow-shm** to scaffold a full featured test server, or run the test engine solely in command line. Test developers can also import **handow** to Node.js application as APIs provider.

![#f03c15](https://via.placeholder.com/15/f03c15/000000?text=+) Highly recommended to clone the [handow-seed](https://github.com/newlifewj/handow-seed) to scaffold your test project if you are **Handow users**.

> **Who are handow users?** The Handow users just want to import **handow** as a module package in their E2E applications. The **handow-seed** project is ready for Handow users' requirements. If you prefer creating custom project and invoke Handow APIs by script or command line, please refer [Handow APIs and Command](https://github.com/newlifewj/handow/wiki/Handow-APIs-and-Command). However, it's appreciate for Handow users spending time to investigate **handow** source code.

## Features

+ Driven by **Playwright APIs** 
+ Simplified Gherkin syntax for test story
+ Built-in steps library and custom steps integration
+ Parameters passing from story and params file
+ Static report generation
+ Multi-workers for parallel running

Refer [Handow Outline](https://github.com/newlifewj/handow/wiki/Handow-Outline) to see more details.

## Install

Make sure [Node.js](https://nodejs.org/en/download/) has been installed to your local machine, versions **">=12.0.0 && <15.0.0"** are recommended).

```
$ npm install handow
# Detect handow installed
$ npm run handow
```

Then the handow help info is printed.

```
$ npx handow --help
> Handow CLI (with npx runner):   $ npx handow --[task] [target-path]

> --[task]                --plan          Run specific plan, followed by a plan path
>                         --story         Run specific story, followed by '.feature' story path
>                         --parsestory    Parse story or stories to suite(s), followed by stories directory or '.feature' story path
>                         --buildstep     Build steps by specific custom step path, followed by custom steps path
>                         --help          Show CLI help, default task

> [target-path]             Target path relative with app root if target required for the task

> Examples:                 [root-path]/$ npx handow --plan /project/myPlan
>                           [root-path]/$ npx handow --buildstep
```

## Usage

Handow developers (code contributors or users who fork handow and customize it in other applications ) can run handow as a Node.js module in an E2E test project, debug it, improve it, or implement the code to others applications. Follow [Develop handow module package](https://github.com/newlifewj/handow/wiki/Develop-Handow-Module-Package) to run **handow** package and debug source code.

## Resources

[Documentation](https://github.com/newlifewj/handow/wiki)

The seed project to implement Handow on Github [handow](https://github.com/newlifewj/handow-seed)

The Handow test server repository on NPM [handow-shm](https://www.npmjs.com/package/handow-shm)

The Handow engin repository on NPM [handow](https://www.npmjs.com/package/handow)

## License

MIT

