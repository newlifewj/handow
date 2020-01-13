# Browser Instance, Browser Context and Page




Unlike the Chrome used in laptops, we see more browser features when we use Puppeteer interacting with Chrome (or Chromium, Headless)

```js
page.$eval(selector, (element) => { ... });     // Use selector find out the first matching element
page.$$eval(selector, (elements) => { ... });   // Use selector find out an array of elements
```

