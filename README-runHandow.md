# Run handow-core solely

Normally users install the full Handow by clone the [out of the box project with demo](https://github.com/newlifewj/handow-seed). In this test engine (**handow-core**) is manipulated by the test server and UI (**handow-shm** package). But users can also run **handow-core** solely in command line interface without **handow-shm** package.

## Run handow-core by install it as node_module

Assuming the **handow-core** was install in a direcoty (e.g _handow/_), like this:

```
handow
    |
    |--- node_modules               // handow-core has been installed as node module packae
```


Users need add several folders and files after clone the **handow-core** package