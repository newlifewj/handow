## Use axios for XHR test

Handow use axios for XHR test. And we create an axios object in this way:

```js
// Create the http agent object
const httpAgent = require('axios').create({
    httpsAgent: new https.Agent({  
      rejectUnauthorized: false
    })
});

// After injected the agent to steps (e.g. in page as "axs"), then it is used in steps in this way:
await page.axs.request(xhr)         // actually we reuse the "axios" in handow without changing to other name
    .then( (resp) => {
        page["xhr"] = resp;
        page["xhreq"] = xhr;    // attached original request properties
    } )
    .catch( (err) => {
        if ( err.response ) {
            page["xhr"] = err.response;
            page["xhreq"] = xhr;        // attached original request properties
        } else {
            return Promise.reject(err);
        }
        
    } ).finally( () => {
        // page["xhr"] = null;
    } );
```

The question is, **Why not use axios.request() directly?**. 

The **axios** object is very good, we can create a new reference by specify some reuqest config. Then we use the **axios instance** without repeat same config again. Here we specify ignore the https selfsigned cert warning, because it block the auto test flow. Then create the axios instance, so that don't repeat same to any where to refer the axios instance. **Great!!!**