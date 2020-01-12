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

### Force update Github remote

Handow use Github repository only for Open-Source relaese instead of coding version working. Handow team interact with CSR in developing, forbiding fetch Github and merge to local repository. The only action on Github is updating it from local dev branch.

> The Github repo of handow is public, so that anybody can clone the project to his local, and then do anything they want. But they can not check in their change.

We use **force pushing** to update Github remote master branch from local dev.

```
// Force updating remote (named "github") "master" branch by local "dev" branch
$ git push --force github dev:master
```

### Exclude source files to Github

If we just update Github remote simply, all the controlled source files will published on Github (same as things on CDR). Of course we don't want publish all to Github, that means we need more sequential operations to exclude source files not going to Github.

> Can not switch .gitignore to exclude source folder or files dynamically, sources are not ignored after they had committed before.

We implement the direct way to ignore extra resource pushing to Github. The solution is: delete these ignored sources - commit - update Github - reset local repository to status before deleting these ignored sources. In order to make sure all these steps are performed easily and cirrectly, a .bat file is created.

```bat
:: (comment line) pushgithub.bat, exclude doc folder for updating github remote ('^' to break line)
rmdir /Q /S doc && ^
git add -A && ^
git commit -m "Prepare pushing to github repository" && ^
git push --force github dev:master && ^
git reset --hard origin/dev
```

The command pipe is quite clear.

+ Remove doc folder including contents, which is the resource not going to Github.
+ Commit the temporary change.
+ Force updating Github remote "master" branch with local dev.
+ Hard reset local with remote dev, then the repo is restored.

So we just need one line to complete the task.

```
$ pushgithu
```

