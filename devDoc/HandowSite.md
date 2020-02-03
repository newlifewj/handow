# Handow Site

Handow site is a web application created with Node.js and React. Main features:

+ Hosting all Handow public documents.
+ The entry for donation to Handow. (e.g. donate Handow to download pdf document or html document)
+ SHandow secured install, authorization and user management

## Application design

### Architecture

Handow site is a Node.js/React SPA, which is deployed on Google cloud. MongoDB is installed for users and **SHandow** instances management. Documents (markdown files) in cloud storage are static resources of Handow Site.

React project is deployed as cloud static resource, the Node.js server deployed as API service. When user access the document, he needn't access the server at all.

### Security

3 roles are permitted access Handow Site.

+ **Visitor**, anybody could access Handow documents as a visitor. A visitor can donate to Handow documents and then download a html documents to local machine. After donated to Handow doc, visitor can choose setup hisown account on Handow Site, after that he can always download updated documents.
+ After a vistor donated to Handow site and created his account, he becomes an **user**.
+ A visitor can register an account, then he becomes an **User**.
+ Except all permissions granted to **Visitor**, an **User** can sign in his account.
+ User can donate to Handow document in his account view. After user domated, he can download html document from his account.
+ User can activate SHandow from his account, then he can see his SHandow instance status.
+ User can pay annual fee for SHandow from his account.
+ **Admin** can do everything, but mostly **Admin** don't want to download doc or domate to Handow. Instead, the **Admin** role can access **user management** dashboard and all related secured pages.

### Description


> Scaffold a demo html page (including .js and .css) for documentation code demo. Document navigate user finishing an UAT project for this demo page. The demo page will host on Handow site.

## Cloud static resource for doc .md files

Handow documents are independent .md files stored in cloud storage instead of database. The urls of these files are constant properties hardcoded in React UI project.


## Thinking

+ Why we need a web application for documents, not a static page?
+ How to map an URL to a static index page?
+ Apply domain from google?