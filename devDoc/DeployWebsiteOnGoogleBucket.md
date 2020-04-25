# Deploy static site on Google storage bucket

The most important and frequently used cloud service is not the complex VM instance, cloud function ... It is the simple **Cloud Storage** (the buckets of Google Cloud).

+ Buckets are cost efficiently to provide static data.
+ Data is structured and maintained easy
+ We can implement accessing control on bucket level (normal IAM control) or object level (ACLs - the fine control)
+ The most important thing is, **a webapp UI stuffs could be deployed as a static website in Bucket**. We always split web application into 2 (or more) parts, a static UI and one or more service provider (e.g. mocro-services).

> When we deploy web application to cloud, mostly include deploy UI and static data to buckets.

## About Bucket

+ Bucket is an objects storage, we can access it with cloud console, cloud CLI and storage API in code.
+ Even if bucket is objects container, but we can access it as path-tree like file system. That make things handy to retrieve buckets and objects by path, and why we can deploy resource to bucket just like static resource server.
+ Buckets deployed in cloud so we access them by internet, the **"root"** of whole google cloud storare is _**https://storage.googleapis.com/**_. The URL of a bucket is _**https://storage.googleapis.com/{bucket-name}**_, and an object URL is _**https://storage.googleapis.com/{bucket-name}/{path}/{object}**_. For example, _https://storage.googleapis.com/bkt2020/jan/snow.png_.
+ The bucket-object accessing policy is implying **a bucket name must be unique among whole google storage**, because all buckets are living in a plate dish - _https://storage.googleapis.com/_.https://storage.googleapis.com/. And we also know each resource in buckets has an unique URI.
+ Resources in google cloud buckets have their unique URIs. So it is possible to access any of them - but only if you have permissions.
+ Buckets could be secured with different level, on bucket or on object to roles. The role could be user, program ... It is really complex issue. But for a static UI bucket, we always keep it public.
+ If we do have some secured resource, we can create a fine-controled bucket for them. **Mostly we need a server with Authen/Auth** to handle secured data instead of Bucket permission. (E.g. the accessing to bucket is permitted to a web program, and we deploy permission control on the web server)

## Website on Bucket

Create a static website is easy, we can always run the static website on local machine (if using relative path for web resources). We can migrate whole resource tree (keep relative paths) to a public bucket, it should work like it is working on local machine. Then the website is available for everybody.

So does for web UI project - if it connect other independent service provider.

However, the simple usage for webUI is not good.

+ The CORS issue becaue all Buckets share same root _https://storage.googleapis.com/_, so the service provider have to set Allow-Origin for this host URL. Probably you don't want do this.
+ We always need our domain for webapp, and we want the web UI host with a domain name instead of _https://storage.googleapis.com/_.

## Use domain name alias Bucket

We can use **_https://storage.googleapis.com/{bucket-name}/..._** to access the static resources in bucket. But don't want use it if we have regiter ourown domain name already.

> The new URL is **_https://storage.cloud.google.com/{bucket-name}/..._**, legacy one is still working.

### Use your domain point to a bucket

After you have a domain name, the first thing is **telling DNS to parse your domain** to IP address. The way to register your domain to DNS is **adding records to DNS**, the DNS will spread your records to DNS servers all over the internat, then you domain is recognized by the world.

There are multiple **record types** for registering your domain to DNS, the basic type is **A** type record. The **A** type record just mapping your domain to an IP address. E.g. An **A-type** record map **_mydomin.com_** with **_107.24.10.150_**.

However, DNS always need handle **sub-domains**. Assuming we want deploy multiple static resources, web sites, service applications ... to one domain name with different sub-domain names but point to same IP, e.g. **_doc.mydomin.com_**, **_www.mydomain.com_**, **_api.mydomain.com_** to IP **_107.24.10.150_**. Of course we can add multiple **A-type** record to do this.

But using **A-type** records mapping multi-subdomains to same IP is not not good way, e.g. you have to change all records if your IP is changed. The better way is setting all records for sub-domains point to one domain name, e.g. **_mydomin.com_**. So that we just need change one record for IP changing, others will follow that **A-type** record.

A record mapping domain name to other domain name is called **CNAME** record. And we have more important reasons to use **CNAME** DNS record in cloud network.

#### Add CNAME record to map your domain to Google storage

The issue is we don't have dedicated IP for our bucket. All buckets in Google storage share a group of IPs. These IPs are dynamically, and complicated navigating process exist between the IPs of Google storage API and your bucket. Shortly, we can not use **A-type** record to map our bucket with our domain. The correct way is using the **CNAME** (a sub-domain name for Google storage API) to create a **CNAME-type** record.

The **CNAME** of Google storage - **_c.storage.googleapis.com_**. Define a bucket, e.g. **mybucket**, and setup **CNAME record** (e.g. doc.mydomain.com with the storage CNAME). After the record is valid in DNS network, we can acceess bucket with our domain: doc.mydomain.com/{a file in bucket}.

### Config a bucket as static website

We can config a bucket as a static website easily with its web config tool, just select **Edit Website Configuation**. Set the index page and error page. That's all.

#### Use bucket as a SPA

The interesting thing is we can upload a SPA UI to bucket (it is just several bundle files). Then we get a comprehensive website living in storge with **Low Costing**

## Get domain and verify in current account

## Define the host name as alias of CNAME

## Specify the index.html

From render storage URL to domain website 
https://storage.googleapis.com/www.handow.org/index.html vs http://www.handow.org

What is "c.storage.googleapis.com"


> Normally we use IAM accessing contrl instead of ACL