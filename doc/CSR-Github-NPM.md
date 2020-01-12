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

