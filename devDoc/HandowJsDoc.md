# Implement JsDoc on Handow code

JsDoc is a set of APIs to generate documentations from JS source code comment. [Refer JsDoc 3](https://jsdoc.app/) to see the JsDoc comment specifications. So we will add JsDoc recognized comments to source code, and implement other tools to extract the comments and create documentations.

+ **jsdoc** - The node package provide APIs parsing the JsDoc-comments and build them to documentaion
+ **jsdoc-to-markdown** - The tool to parse the JsDoc-comments and build them to markdown file
+ **gitbook-cli** - The command APIs to build the GitBook (which is the documentation platform used in Github) basing on markdown files

We choose implement **jsdoc-to-markdown** and **gitbook-cli** in **handow-core** developing

## Documentation coverage

We cannot and needn't add documents to every details of the source code, actually we even don't expose some details to documentation. The documents will cover follwing code blocks in **handow-core**:

+ Module
+ Function
+ Constant

### Module document

```js
/**
 * Module literal name.
 * @module module-identify-with-space
 * @description Description for this module
 * /
```

For example:

```js
/**
 * The foo handow module
 * @module FooModule
 * @deprecated since version 0.18.0
 * @description The FooModule is used for ...
 * /
```

### Function document

```js
/**
 * @function myFunction
 * @param {*} fooParam
 * @return {number}
 * @description The function ...
 * /
```

### Constant

```js
/**
 * @constant {string} projectName
 * /
```

## Other comments

We can always user comments other than the JsDoc format.

## Build md document

We call the jsdoc2md CLI to generate md files. For example, add scripts in _package.json_ like:

```json
"scripts": {
    "mdDoc": "jsdoc2md --files lib/eventBus.js > documents/eventBus.js.md"
}
```
Or generate markdown doc for all .js files

```json
"scripts": {
    "mdDoc": "jsdoc2md --files lib/**/*.js > documents/handow-doc.md"
}
```

## Build Gitbook

[Integrating GitBook with JSDoc to Document Your Open Source Project](https://medium.com/@kevinast/integrate-gitbook-jsdoc-974be8df6fb3)

