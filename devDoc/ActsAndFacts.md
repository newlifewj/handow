## How many Acts and Facts need defined in step library.

+ Do nothing, await
+ Go to URL
+ Reload page   $$%%
+ Forward       $$%%
+ Backward      $$%%
+ Scrool page.evaluate(_ => {           ??
  window.scrollBy(0, window.innerHeight);
});
+ Interact with dialouge, e.g. alert?  $$ %%
+ verify dociment downloaded        ??%%

+ iframe acts and facts (a lots!!)  %%


+ verify new tab or window opened by page.on('popup')       %%


+ Handle Http Basic Authentication      %%
+ Click
+ Focus
+ Hover
+ page.select API, select a dropdown    %%
+ Set cookie
+ Set Cache enable
+ Set Header
+ page.setDefaultNavigationTimeout(timeout)
+ file picker page.waitForFileChooser([options])    %%
+ Keyboard actions              %%
+ Mouse actions                 %%
+ Mobile actions tap and touch  %%
+ EventHandler to verify element attributes (properties?) or we can call the standart Elemnt API?
+ Verify styles, positions, offset






### Use page.emulate() to set the view port

The device list [https://github.com/puppeteer/puppeteer/blob/main/src/common/DeviceDescriptors.ts](https://github.com/puppeteer/puppeteer/blob/main/src/common/DeviceDescriptors.ts), we can add custom device to the list, e.g. desktop, desltopX ...

```js
[
    {
        name: 'Kindle Fire HDX landscape',
        userAgent:
        'Mozilla/5.0 (Linux; U; en-us; KFAPWI Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Silk/3.13 Safari/535.19 Silk-Accelerated=true',
        viewport: {
        width: 1280,
        height: 800,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        isLandscape: true,
        },
    },
    {
        name: 'iPhone 7',
        userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
        viewport: {
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        isLandscape: false,
        },
    }
]
```

### Big task - record console output (errors) and show it in reports

page.on(console) API


### Verify elements style

```gherkin
# Verify one single style on one or multiple elements
Then I verified the style item {item} of it {selector} with value {value}
```

The styles of an element come from 2 ways: style attribute on element & css file (computed styles)

We can eval selector to ElementHandler and get its style property to verify specific style items

We can call Web API: Window.getComputedStyle() to get commputed styles

```js
const data = await page.evaluate(() => {
    const elements = document.body.getElementsByTagName("*");

    return [...elements].map(element => {
      element.focus();
      return window.getComputedStyle(element).getPropertyValue("font-family");
    });
  });
```

**In the Act step, try these 2 methods and the style-attribute alwyas override the css styles**, so, we check the style-attribute at first, if it's not existed, then try css styles.


### Loayout testing

getOffset

getComputedStyle can help us do this 


### Dialog verification

We need aware dialog in each story (add the dialog listenner), so that we can implement the **Then** step to verify and handle the dialog. I believe there is only one dialog exiting normally. (or we have to iterate all dialogs to dismiss them)

> Add dialog listener to all stories globally, big task
