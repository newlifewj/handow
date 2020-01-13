# Collaboration between CSR, Github and NPM

Handow project has 3 remote repositories for version-control, collaboration and distribution.

+ The Git **CSR** instance as normal version-control, it is synchronous with all Handow source files by daily Git operations along with developing.
+ The Github repository as open-source distribution, it releases the public source files on demand. For example,the Github repository is updated only when a new version is stable.
+ The NPM repository for publishing the module, it releases the core library files as a package so that users can install it easily.

The requirement is a little bit complex. The first thinking is using 2 local repositories for CSR and Github remotes, and we keep code consistent manually by copy relevant source files for CSR-local project to Github local. As for NPM, we can publish package from Github source tree on demand. However, copy files manually is boring and error prone, it seems like not the _Git-Way_. Here we do it basing on the single local source tree - the **dev** branch of CSR repository.

## Handle Github updating

Needn't talk about how to implement Git-CSR, it is the normal Git working flow. Developer can clone the CSR remote, then his local repository has only one remote.

```
$ git remote -v
> origin  ssh://newlifewj@gmail.com@source.developers.google.com:2022/p/handow-uat/r/handow (fetch)
> origin  ssh://newlifewj@gmail.com@source.developers.google.com:2022/p/handow-uat/r/handow (push)
```

Assuming a Github public repository was created for Handow, it should be added as a remote too.

```
$ git add remote github https://github.com/githubrepo/handow.git    // named the adding remote as "github"
```

Then we can see the Github remote was added.

```
$ git remote -v
> github  https://github.com/mygithubrepo/handow.git (fetch)
> github  https://github.com/mygithubrepo/handow.git (push)
> origin  ssh://newlifewj@gmail.com@source.developers.google.com:2022/p/handow-uat/r/handow (fetch)
> origin  ssh://newlifewj@gmail.com@source.developers.google.com:2022/p/handow-uat/r/handow (push)
```

> The CSR and Github remotes are not synchronous, we can not checkout both of them. The Github remote is just for hard updating.

We use **force pushing** to update Github remote master branch from local dev.

```
// Force updating remote (named "github") "master" branch by local "dev" branch
$ git push --force github dev:master
```

If we also want Github repo is tagged, the updating command should be:

```
$ git push --force github dev:master --tags
```

### Exclude source files to Github

All the controlled source files will published on Github (same as stuffs on CDR) If we just update Github remote simply. That's not the requirement, instead some private and sensentive resources are forbidden on Github remote.

> Can not switch .gitignore to exclude source folder or files dynamically, sources are not ignored after they had committed before.

We implement the direct way to ignore extra resource on Github pushing. It is a "multi-steps" solution:

+ Be sure every thing is commtted and pushed to CSR, local repositoy and IDE changing are clean.
+ Delete resources which need to be ignored on Github remote.
+ Commit the delete locally
+ Update Github remote
+ Hard reset local repository with CSR remote dev branch, then local dev is revovered

Use a batch file (or shell script for none-windows) to perform all these sequential operations to make things easier. For example, we want ignore _**doc**_ folder on Github, the runner is _pushgithub.bat_:

```bat
:: (comment line) pushgithub.bat, exclude doc folder for updating github remote ('^' to break line)

rmdir /Q /S doc && ^
git add -A && ^
git commit -m "Prepare pushing to github repository" && ^
git push --force github dev:master --tags && ^
git reset --hard origin/dev
```

So we just need one line to complete theGithub remote updating task, **Great!!**

```
$ pushgithub
```

> Actually the tags (versions) are not necessary in Github, guessing people always clone the latest, but it's harmless anyway. However, the version tag is important for npm publishing and CSR history.

## Publish module package to NPM




.npmignore file, ignore more


### Put a tag as version

As for working on CSR, we pull/push source very frequently. That's not necessary to put any tag for each commit. Maybe just for some significant updating. 

But now we have Github remote and NPM publishing, it's better to put tag on each NPM updating.

Assuming we have commit all changes to CSR, **!!!Make Sure!!!**. And we decide to publish a new version to NPM, we should perform following sequential actions.

+ Change package.json, modify version to higher version what you want, e.g. "v1.0.2".
+ Then commit change.
+ Then put a tag to current commit, which is the version right now in package.json
+ Then push tags to CSR

Now we have taged CSR, we can update

$ git tag v1.0.0

Add a tag to local repository
Add the tag to the most recent commit, Not Including the uncommitted changing.
We can add a lot of tags without pushing them to remote.
$ git tag

Check all tags of locally, maybe some of them are not pushed to remote.

$ git push --tags

Pushed all local tags to remote.

The correct operation sequential **After modify version (e.g. v1.1) in package.json**

```
$ git add -u
$ git commit -m "commit with version changed - v1.1"
$ git pull
$ git push              // pushed to remote dev, package.json is re-versioned
$ git tag v1.1          // Added tag to current commit
$ git push --tags       // push all tags, the v1.1 taged repo is same as dev Head now
$ pushgithub            // push to github with tags, and local will be restored back to dev Head
// Github doesn't has the v1.1 tag because dev is committed before tag it, it is okay
```

## Install package from Github or CSR remote

## Use npm-link accessing local resources as npm-module-package