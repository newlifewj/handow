# Present reports and running monitor

Handow integrate and transform the raw reports into a JSON object. Then Handow's UI can render it into a chart and a clean story list.

## Chart

+ Each Fact step evaluation is a testing.
+ one Fact evaluate in different phases, stories and stages are different testing in result.
+ Facts in different looping cycles are also different testings.

We can get total testing quantury and success count easily from **result.json**, then render a pie chart.

> A chart is not much help for project developing or management, but it is the most intuitive way to show application status.

## List

If we want look into each testing details, the result list is helpfule. Infomations in the list should be:

+ Stages
+ Stories
+ Steps (with labels)
+ Screenshots
+ Error info for failed Facts
+ timestamp

And user can implement sorting and filter on the list table.

In the list, screenshot was linked.

For API test, Reques/Response shoud be recorded in the report.

### results recorded in reports

Some resource will be saved to **Phase**

+ Screenshot
+ Http request and response if this phase include API call **????**

## Handow Super UI

For super users, they need more features than Handow built-in UI, besides presenting reports

+ Assuming they have deployed an UAT server, so they need powerful UI to interact with UAT.
+ So they can deploy Super UI in the UAT server.
+ They can also deploy Super UI as independent cloud instance (Recommended).
+ Through Super UI, they can list plans and set **Schedule** to run the plan
+ Even they can deploy multiple test servers (e.g. one for daily report and one for developing features), Super UI can handle multiple test servers and their results.
+ With the SuperUI, user can start, stop a plan.
+ User can browse reports history.
+ User can see a chart for history trend.
+ User can monitor test runing on line (Websocket should be deployed)
+ User can see the **Test Tree** presenting test result on realtime.
+ User need pay for using Super UI.

## Super UI design

+ Independent project
+ Handow has hidden API already for communication with Super UI.
+ Once user authenticated and reach the UI, communication occured between user's browser anf his test server.
+ Super UI just take the authentication things.
+ User should put his credential to test servers.

### When take a screenshot? Each phase just before evaluate Facts (when start fact evaluation, screen should be stable)
