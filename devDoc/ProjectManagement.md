# Handow Projects Updating and Deployment

## The *handow-core* project

After **handow-core** project (handow engine) is changed and tested locally, we can publish a new version in 3 steps:

### Push code to Git repository with new version

+ Verify the version property in _package.json_ to be the new version.
+ Push code
+ Add and push a new tag to repository, the tag is the new version code.

### Push code to Github

The **Handow-core** is an opensource project, so the code is published in Github synchronous with new version publishing. There is a batch script to update Github. The handow-core project has 2 remote repository URL - Github and the SRC Git repository. We **NEVER** pull code from Github URL, and will not push some dev-files to Github. So, we define a batch script for updating *handow* in Github.

```bash
$ pushgithub
```

### Publish the module to NPM repository

Publish *handow* to NPM with the new version

```bash
$ npm publish
```

## The *handow-shm* and *handow-shmui* project

The **handow-shm** project is the server, and the **handow-shmui** is the UI project of the server. They are 2 independent project in code base but **one module** in NPM.

**handow-shm** and **handow-shmui** are not opensource projects now, so we needn't push them to Github.

### Step1 - build project

We need build **handow-shm** or **handow-shmui** before publish a new version. Before run build, verify the version property in _package.json_ to be the new version.

```bash
$ npm run build
```

### Step2 - push project to SRC Git

Push the code, add and push a new tag to repository, the tag is the new version code.

### Step3 - Publish the module to NPM repository

The **handow-shm** and **handow-shmui** are build into one package and publish to NPM as *handow-shm* module.

+ When the **handow-shm** project is built, the cource code is processed into _**/dist**_ dorectory.
+ When the **handow-shmui** project is built, the built result files also locate in its _**/dist**_ dorectory.
+ We need copy the built result files of **handow-shmui** and paste them to the **_/dist_** folder of **handow-shm**. The copied files are _index.html_, _main.\[hashcode\].css_ and _main.bundle.\[hashcode\],js_ (3 files).
+ Verify the version in _package.json_ file in the **_/dist_** folder of **handow-shm**, make sure it is the new version.
+ Then publish the *handow-shm* package (which included the shmui resources already).

**Make sure publish the handow-shm package from the /dist direcory**

```bash
[handow-shm root]/dist $ npm publish
```

## The *handow-seed* project

The **handow-seed** is demo project implement *handow* and *handow-shm* modules. It is a public project in Github, and we put all Handow doxuments to this project.

The **handow-seed** is updated only if

+ The seed template is changed
+ The demos are changed or new demos are added
+ Documents updating

## Deploy a Handow server to cloud

Users can scaffole their test application basing on the **handow-seed** project. It is easy to deploy the test application to cloud as a server for test automation. For example:

+ A VM (e.g., an Ubuntu instance) is available.
+ Node.js has been installed to the machine.
+ Git has been installed to the machine, and the test project (e.g., **handow-uat**) located in a Git repository

### Install more libraries for browsers

The VM instance is created with a linux image, e.g., Ubuntu 18.04 LTS. However, those default OS images maybe not supporting some features for local browser running. You need add them manually. For example, the following command can add libs for **Chrominum** running.

```bash
$ sudo apt update
# Install libs supporting Chromium (need more libs required for firefox or webkit)
$ sudo apt-get install gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget libgbm-dev
```

### Clone the application to ubuntu and start it manually

```bash
/opt/apps $ git clone [...]/handow-uat
```
Install dependencies

```bash
/opt/apps/handow-uat $ npm install
```

Then test the handow server just like run it in local machine

```bash
/opt/handow-uat $ sudo npm start
```

The test server will start at port **3333** with **public** mode, you can access _http://[IP Address]:3333/_ with any browser client.

> The Handow test server depends on file system as data store. In order to get full permission for accessing file system, we must use **sudo** command to start the server.

### Configure the test server as daemon service

We can ask **systemd** to manage the test server as a daemon auto start running in background. The service unit file could be:

```bash
# /usr/lib/systemd/system/handowuat.service
[Unit]
Description=Handow UAT test server

[Service]
PIDFile=/tmp/handow-uat.pid
Type=simple
# The User is the login user
User=hdwUser1
# 'WorkingDirectory' is very important, it define the working root of the service running, and the realtive paths are relative with this path!!!
WorkingDirectory=/opt/handow-uat
# handow-demo will run at port 3333 with public mode by default if "--[mode]" "--[port]" not specified
# ExecStart=/usr/bin/sudo /usr/bin/node node_modules/handow-shmlaunch.js
ExecStart=/usr/bin/sudo /usr/bin/node node_modules/handow-shm/launch.js --secure --3333
# ExecStart=/usr/bin/sudo /usr/bin/node node_modules/handow-shmlaunch.js --private --3400

[Install]
WantedBy=multi-user.target
```

Start the service manually, then we can access the management UI with URL _http://[IP Address]:3333/.

```bash
$ sudo systemctl daemon-reload
$ sudo systemctl start handowuat
```

### Commands often used for server deployment

The _systemd_ is the deamons manager in Linux system, and the _systemctl_ command is the API of _systemd_

```bash
# check a service status, it is 'alive' when it is running now
$ sudo sytemctl status [service-name]

# After the Unit files (server config files) changed, we should reload the daemons
$ sudo systemctl daemon-reload
# Or reload specific service
$ sudo systemctl reload [service-name]

# Manual start a service in machine running (All daemon services are stated after machine restart)
$ sudo systemctl start [service-name]
# Or restart service when it is running
$ sudo systemctl restart [service-name]

# Stop a service
$ sudo systemctl stop [service-name]

# Uninstall all packages in node_modules
$ sudo npm uninstall *

# Force remove a directory and all contents
$ sudo rm -rf [directory]

# Change file permission
$ sudo chmod 777 [file]

# Check disk space
$ df -h

# Run test server manually
$ node node_modules/handow-shm/launch.js --public --3333

# Change mode with recursive
$ sudo chmod -R 755 /opt/lampp/htdocs

# List ports in use
$ sudo lsof -i -P -n | grep LISTEN
$ sudo lsof -i:22 ## Or see a specific port such as 22 ##

# Kill a process by pid
$ kill -9 [PID]       ## E.g., kill -9 39852 ##

# Export MongoDB (all collections) #
$ mongodump -d <database_name> -o <directory_backup>

# Restore MongoDB
mongorestore -d <database_name> <directory_backup>      
```
Got errors when run 'sudo npm install' -  EACCES: permission denied, open '/opt/apps/handow-seed/node_modules/playwright/playwright-download-chromium-ubuntu18.04-888113.zip'
    at /opt/apps/handow-seed/node_modules/playwright/lib/install/installer.js:124:19, Use following command works
```
$ sudo npm install --unsafe-perm=true --allow-root
```

**Important:** The Debian based linux, e.g. Ubuntu, need additional libraries to support Puppeteer API:

```bash
my_vm:/$ sudo apt update
my_vm:/$ sudo apt-get install gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget libgbm-dev 
``` 



