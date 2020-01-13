# Html Render

The **Html Render** include a html file, a javascript file and a css file. E.g. _**index.html**_, _**main.js**__ and _**main.css**_. The screenshot files could be rendered if they are available. (screenshots is optionally for test running).

## How to set up the render

At test finishing point, Handow generate the render in the reports path together with the record JSON file. The _**main.js**__ and _**main.css**_ are just common resources copied from Handow package. There is a render projet (React project) which generated these 2 file by building.

The _**index.html**_ is a little bit special, it is a template file from the render project and Handow populate the template with current test JSON data, and then save it as _**index.html**_.

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <title>Handow UAT Reports</title>
        <link href="main.css" rel="stylesheet">
    </head>
    <script>
        <!-- Replace "^...^" with JSON data -->
        var _hdata = JSON.parse( JSON.stringify( ^_json-report_^ ) );
    </script>
    <body>
        <div id="report-render-root" class="report-layout-ctner"></div>
        <script type="text/javascript" src="main.js"></script>
    </body>
</html>
```

When user open (or handow open it automatically) the _**index.html**_, the record data existed already. The _**main.js**_ just download to page and consume the existing data. The following render is just JavaScript work designed by the render project.

> Must keep the path relationship of the render and screens when move them to other path (e.g. archive them). The rule is **All of them in one folder flatly**.

## Features of the render

The HTML Render is designed for 2 usage:

+ Render local test result by open the _index.html_ with local browser.
+ Put test result to remote storage or as a static website, user can render it by remote browser.

In both cases, users can not use path navigation and deeplink (but javascript can help user browse different render views). If user want more, install Super UI. Because Super UI can provide powerful features, we just **keep the HTML Render simple and easy**.

Actually the HTML Render just provide 2 dashboard views (no path, just switched by JS): **Summay** and **Story Details**.

### Summary - the homepage

It is the default page when render is opened.

+ Static stuffs like plan name ...
+ The pie chart with summary as legend.
+ Report download button (json, cvs(later), pdf(far future)).
+ Stories list by stage with color background.
+ Every story is a link too, click it switch to its story detail dashboard.

### Story Details

Story Details is an interaction table showing phases, looping and every steps.

+ A button back to homepage.
+ static stuffs like story name, descriptions ...
+ Summary for this story, and the summary items are also the filter of the details table.
+ a list of phases with status and timing and ...
+ For the story level looping, show then in flat way but use indent and background color interlacing.
+ For each story level looping show relevant parameters above.
+ Phase level looping is not flat open, but a small tip showing the looping times.
+ Every phase has 2 image icons: start -> end, click it pop over the screen card.
+ The phase items are expandable, click the expand icon to open the steps list below it.
+ The phase expand icon can shink the steps list also.
+ The loopin of the phase is indicated some how when expand the steps.
+ For each looping, show relevant parameters.
+ Each step show status, and screenshot, error message show for failed or broken steps.
+ click the screenshot image icon of the step pop over the screen card.

The screen card:

+ show step title of the scrrenshot.
+ show screenshot image
+ a close icon, or click area out of the card, to close screen card.
+ Next/Previous arrow show all screens of current pahse looping.
+ A link to open relevant application view in blank tab (same URL).

