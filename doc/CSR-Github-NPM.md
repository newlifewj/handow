# Collaboration between CSR, Github and NPM

Handow project has 3 remote repositories for developing version-control, collaboration and distribution.

+ As normal developing version-control, a Git **CSR** instance is used synchronously with all Handow source files.
+ As open-source distribution repository, a Github repository is used to release public source files on demand. For example,the Github repository is updated only when a new version is stable, not including private resources.
+ For publishing code module online, the NPM repository is used to releases the core library files as a package.

> The requirement is a little tricky. The first thinking is using 2 independent project for CSR and Github, and keep them synchrous manually by migrating source files from CSR to Github local repository before pushing to Github. And then publish NPM pacakge from Github source tree. It should work, but the manual operations are boring and error prone.

There is a solution to meet the requirement basing on same branch of Git-CSR.

## Handle Github updating

Work arroud with CSR is just the normal Git working flow, but it isn't the same thing with Github. Here we treat Github as a **Hard-Updating-Only** remote repo. After developers clone the CSR remote, his local repository has only one remote.

```
$ git remote -v
> origin  ssh://newlifewj@gmail.com@source.developers.google.com:2022/p/handow-uat/r/handow (fetch)
> origin  ssh://newlifewj@gmail.com@source.developers.google.com:2022/p/handow-uat/r/handow (push)
```

Assuming a Github public repository was created for Handow, we add it as another remote.

```
$ git add remote github https://github.com/newlifewj/handow-core.git    // named the adding remote as "github"
```

Then we can see the Github remote was added.

```
$ git remote -v
> github  https://github.com/newlifewj/handow-core.git (fetch)
> github  https://github.com/newlifewj/handow-core.git (push)
> origin  ssh://newlifewj@gmail.com@source.developers.google.com:2022/p/handow-uat/r/handow (fetch)
> origin  ssh://newlifewj@gmail.com@source.developers.google.com:2022/p/handow-uat/r/handow (push)
```

> The CSR and Github remotes are not synchronous, we can not checkout both of them. The Github remote is just used for hard updating.

We use **force pushing** to update Github remote master branch from local dev ("github" is the Github remote name, we update its "master" branch by local CSR "dev" branch).

```
$ git push --force github dev:master
```

If we also want Github repo is tagged (it is not necessary but harmless), the updating command should be:

```
$ git push --force github dev:master --tags
```

### Exclude source files for Github repo

As mentioned before, we can force updating Github remote. But the updated Github remote repo is exectly same as CSR local dev. That doesn't meet the requirement, we want some secured resources are excluded on Github.

> **It Is Not Possible** to make the 2 remotes differently by switching _.gitignore_ file. The resouces can not be ignored again after they have been checked into a remote repository.

We implement the "multi-steps" solution to resolve excluding resources on Github:

+ Be sure all IDE changes are saved, and all the changes are commtted and pushed to CSR.
+ Delete resources which need to be ignored on Github remote.
+ Commit current deleting change.
+ Update Github remote.
+ Hard reset local repository with CSR remote dev branch, then local dev is recovered

In order to avoid making mistakes when perform muli-steps operation, a batch script could help us and make things easier. For example, we want ignore _**doc**_ folder on Github, then we create a batch runner: _pushgithub.bat_:

```bat
:: (comment line) pushgithub.bat, exclude doc folder for updating github remote ('^' to break line)

rmdir /Q /S doc && ^
git add -A && ^
git commit -m "Prepare pushing to github repository" && ^
git push --force github dev:master --tags && ^
git reset --hard origin/dev
```

Then we can finish updating Github remote with excluding in one shot, **Great!!**

```
$ pushgithub
```

> Actually the tags (versions) are not necessary in Github, guessing people always clone the latest, but it's harmless anyway. However, the version tag is important for npm publishing and CSR history.

## Publish module package to NPM

Although NPM can depend on .gitignore to exclude resources, but we prefer using independent .npmignore because source code and executing module are totally different things (But they share a lot of things in Node application).

> Publishing and updating npm pkg is the same thing. _"npm publish"_ can update exisied package.

It is not necessary to keep Github release synchronous with NPM pkg updating, but better to do this. The steps to update package on NPM online repository:

+ Change the version field in _package.json_, **!!important!!**
+ Be sure all IDE changes are saved, and all the changes are commtted and pushed to CSR.
+ Taged current commit and push tags to remote.
+ Perform Github updating by call the batch file - _pushgithub_.
+ At last, call _npm publish_ from dev.

### Put a tag as version

Versions help us access definite status of the code, it becomes more important after we have published mudlues with version to NPM. Different users could refer different versions, and we need access the relevant project status exactly. It is not necessary adding version tag on each commit. But we **must add version tag before updating NPM**.

Git command adding tag to local repository. This will add tag to current commit in local repository (not cover un-committed changes). 

```
$ git tag v1.0.0
```

After tag was added, it's only valid in local repository until pushing it especially, e.g. push to remote together with existed tags:

```
$ git push --tags
```

## Use npm-link accessing local resources as npm-module-package