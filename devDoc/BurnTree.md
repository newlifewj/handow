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

## Generate planTree in run time

SHMUI need the plan tree to show tree burning.

+ when handow is idle, user can always open a pan tree by select a plan from explorer.
+ when handow is running, user can not choose any plan from explorer.
+ when handow is running and user go to Runner, he can see current running plan tree burning. And the tree is updated when plan changed by schedule.

### Can not use .plan.tree file

We use a static plan.tree file as a tree of the plan. The tree is generated once user choose this plan from explorer, and then save it as file. Then we access this file as tree for future test running.

**That doesn't work!!!!!!!!!!!!**

+ If user didn't open plan by choose it from explorer, the tree file is not created!!
+ After the tree file created, it is hard to update it when plan, parameter, stories ... changing!!!
+ So there will bw issues of no-tree or wrong-tree.

### We always generate the tree in run time

+ When user choose a plan by runner's explorer, SHM ask handow generate the tree on fly.
+ When handow put a plan to run, it will generate the tree before run the plan, and save the tree to handow status (SHM can get the tree by handow.handowStatus).
+ No tree file existed, so the tree allways keep synchronous with plan, stories, parameters ...
+ User can open a tree and run the plan manually, then the tree burning is ahowing
+ When handow is running, user can go to Runner, then he load current planTree from handow and show current burning.
+ The SSE start command will trigger runner updating plan tree

### We still need planTree file in record (latest record and archived records)

When SHMUI open an record, it will open the burned tree. This tree must be a file together with other record files. And the planTree must be archived.

+ When handow persist the record JSON file, it will persist current planTree into a file.
+ So SHMUI can open planTree of the record

### Which tree is opened by Runner (of SHMUI)

+ When handle is idle, Runner doesn't open any planTree by default.
+ User can choose a plan from Explorer and open the plan tree in UI, but the plan tree is not set as **Running Tree** of handow before user run it.
+ User will open the running plan tree by default when handow is running (and he can not choose other plan from explorer when handow is running). The running tree object was set to handow status before that plan running.