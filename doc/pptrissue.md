# Puppeteer Issues

## svg element issue

Element not clickable.

```html
    <svg clas="" h4w="" onClick={...}>
```

The svg element is not clickable after pptr access it, guess it is browser event binding issue. The error is:

    Evaluation failed: TypeError: element.click is not a function at __puppeteer_evaluation_script

We fix this by wrapping svg with a container, it is recommended for all 3-party components and special tags

```html
    <div clas="" h4w="" onClick={...}>
        <svg ...></svg>
    </div>
```

> But click svg works when interact with browser manually. That is the difference between UI operating and pptr accessing.