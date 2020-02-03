# How Cucumber Help Handow

We borrow **Cucumber-js** plugin to help using **Handow** in IDE.

+ With help of Cucumber-js, we can write feature file (**Literal-Suite**) friendly in IDE, e.g. the highlight, syntax checking, ...
+ We can also refer the steps in IDE, so that to reuse steps easily.
+ Jump to step from Given/When/Then.

But we don't implement cucumber itself.

## We should have Handow pluggin finally

Cucumber-js pluggin can help us a little bit. But the drawback is we have to obey its rules, e.g. the step format. The question is **Why create steps like this if we do not use Cucumber actually?** Furthermore, cucumber pluggin doesn't support generating dummy step.

So ---

In the future, we should create our Handow pluggin to work arround IDE integration.

+ Literal steps in feature file refer steps, including jumping, promotion ...
+ Generate Dummy steps (Listen literal suite updating and generate Dummy steps if not existed).
+ Steps should distinguish parameters quantity.
+ Tools to report steps information, remove zombie dummy steps.
+ Compose suites basing on **JSON Suite** objects and **Step Catalog**.
+ Plan runner
+ Report process and integration
+ Report UI project and **Remote Runner**

## Conclusion

+ Before creating Handow IDE pluggin, we just borrow cucumber IDE plugin temporarily.
+ We create cucumber feature file as Literal Suite.
+ We create Handow tool to generate dummy step - obey cucumber step format.
+ We create Handow tool to compose suite from JSON-Suite and steps.
+ We create Plan runner
+ We create Report processor
+ We create Report UI
+ We create remote UI for Plan Runner and realtime monitor.


