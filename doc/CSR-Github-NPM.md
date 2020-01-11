# Collaboration between CSR, Github and NPM

The requirements:

+ Project use CSR-Git as source developing version-control and collaboration repository.
+ As an Open Source Project, also publish to Github - but not all source files. For example, I don't want expose the documents to github.
+ For easy distribution, the project will be a node package available on NPM. Allthough user can always install project with github URL, it is better to publish a package to NPM on-line repository. NPM is not a source code sharing platform, so we just need push necessary files to it.

How can we do this?
