## Burn the plan tree

SSE scenario testing message (data) format:

```js
// Each message carry a scenario result to SHMUI
{
    type: "data",    // the data payload only available for type === "data"
    data: {
        // a scenarion is a leaf of the tree | plan-->stage-->story-->storyLoop-->phaseLoop-->scenario
        stageIdx: "number",
        story: "story name"
        storyLP: "number",
        whenIdx: "number",      // only for whenLP
        whenLP: "number",
        steps: {
            // string status array, could be "ready|passed|failed|skipped", e.g. ["passed", "passed", "skipped", "failed"]
            acts: [],   // "acts === null" means current scenario is skipped.
            facts: []   // 
        }
    }
}
```

SSE info maeeasge format (other than scenario testing result)

```js
{
    type: "signal"
    // ... anything explain by SHMUI side.
}
```

### Handow write scenario results to SSE

+ The SSE endpint is created by SHM server by specify an URL.
+ Browser side create an EventSource object to connect the SSE endpoint to set up the connection between browser and server.
+ SSE is not established before browser side connect to it. Because there is no 'response' object created in SSE endpoint if no browser called the endpoint.
+ After a browser connect the endpoint (the EventSourec instance was created in browser side), SSE is active in server and server can write meaasge to SSE endpoint.
+ SSE endpoint active doesn't guarantee browser listeners can reveive the messages. The browser listeners may lose the SSE connection due to some reasons. So the browser side must maintain the connection by re-connecting (create a new EventSource)

There is **sse** service existed in handow-core. SHM must pass the **res** reference to handow's sse when the SSE connectiong set up. Handow test (siuteRunr) can access **sse** and write scenario result to sse - writing to **res** in sse service.

The handow-core sse service is exported in handow API, so SHM can pass res to sse by call sse.init(res).

