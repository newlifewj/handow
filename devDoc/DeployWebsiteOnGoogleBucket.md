# Deploy static site on Google storage bucket

The most important and frequently used cloud service is not the complex VM instance, cloud function ... It is the simple **Cloud Storage** (the buckets of Google Cloud).

+ Buckets are cost efficiently to provide static data.
+ Data is structured and maintained easy
+ We can implement accessing control on bucket level (normal IAM control) or object level (ACLs - the fine control)
+ The most important thing is, **a webapp UI stffs could be deployed as a static website in Bucket**. We always split web application into 2 (or more) parts, a static UI and one or more service provider (e.g. mocro-services).

> When we deploy web application to cloud, mostly include deploy UI and static data to buckets.

## About Bucket

+ Bucket is an objects storage, we can access it with cloud console, cloud CLI and storage API in code.
+ Even if bucket is objects container, but we can access it as path-tree like file system. That make things handy to retrieve buckets and objects by path, and why we can deploy resource to bucket just like static resource server.
+ Buckets deployed in cloud so we access them by internet, the **"root"** of whole google cloud storare is _**https://storage.googleapis.com/**_. The URL of a bucket is _**https://storage.googleapis.com/{bucket-name}**_, and an object URL is _**https://storage.googleapis.com/{bucket-name}/{path}/{object}**_. For example, _https://storage.googleapis.com/bkt2020/jan/snow.png_.
+ The bucket-object accessing policy is implying **a bucket name must be unique among whole google storage**, because all buckets are living in a plate dish - _https://storage.googleapis.com/_.https://storage.googleapis.com/. And we also know each resource in buckets has an unique URI.
+ Resources in google cloud buckets have their unique URIs. So it is possible to access any of them - but only if you have permissions.
+ Buckets could be secured with different level, on bucket or on object to roles. The role could be user, program ... It is really complex issue. But for a static UI bucket, we always keep it public.
+ If we do have some secured resource, we can create a fine-controled bucket for them. **Mostly we need a server with Authen/Auth** to handle secured data instead of Bucket permission.

## Website on Bucket

Create a static website is easy, we can always run the static website on local machine (if using relative path for web resources). We can migrate whole resource tree (keep relative paths) to a public bucket, it should work like it is working on local machine. Then the website is available for everybody.

So does for web UI project - if it connect other independent service provider.

However, the simple usage for webUI is not good.

+ The CORS issue becaue all Buckets share same root _https://storage.googleapis.com/_, so the service provider have to set Allow-Origin for this host URL. Probably you don't want do this.
+ We always need our domain for webapp, and we want the web UI host with a domain name instead of _https://storage.googleapis.com/_.

## Use domain name alias Bucket


## Get domain and verify in current account

## Define the host name as alias of CNAME

## Specify the index.html

From render storage URL to domain website 
https://storage.googleapis.com/www.handow.org/index.html vs http://www.handow.org

What is "c.storage.googleapis.com"


> Normally we use IAM accessing contrl instead of ACL