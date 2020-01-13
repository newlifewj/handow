# Parameters and looping

We can pass paramteter to steps When creating literal steps in a feature file (Literal Suite or simply **Story**. **Why?** The major purpose is **Step Sharing**. If a step is bound with an actual constant value, it is hard to be reused by other test scenarioes. For example:

    # The literal step to click Submit Profile button
    When I click the button 

We don't use variable as the selector of the button element, instead just hardcode an element **id** in step code (e.g. "_#profile-submit-button_"). The result is we couldn't use this step function for clicking any other buttons. However, the issue is resolved easily if the **id** was passed as a parameter, and then this statement could be used for other clicking acts.

    # We can pass selector as parameter to make click-button as a shared step
    When I click the button {selector}

## Examples for passing parameter from Literal to Step

Here we call **Literal-Step** (a _Given/When/Then_ statement in Story) just as **Literal**, and call the **Real-Step** (the relevant actual code function for **Literal**) as **Step**.

### No parameter at all

    # An action literal statement
    When I click Submit Profile button

```js
// Possible Step for upper Literal
When("I click Submit Profile button", () => {
    // Hardcode the selector inside step
    await page.$eval( "#profile-submit-button", (ele) => ele.click() );
})
```

We can see a Literal bind with a Step, and it is working. But there are some drawbacks.

+ The Literal is clear enough but it is dedicated for clicking _"Submit Profile"_ button. We have to use different Literal for clicking _"Add User"_, _"Submit User"_, _"Cancel"_ and so on.
+ Suppose it is better to make the Literal more generally so that we can share it for click all id-buttons. But we can not do that because the **selector** in Step is hardcoded (with the Submit Profile button id).
+ If we implemented a specific Step for each Literal, the test code is difficult to refactor. For example, we have to change all click-button-steps code one by one after html changed.
+ Actually test developers don't want put a lot of time to maintain Steps, it is better to maintain Literals - especially the parameters in Story file.

### Pass value from Literal to Step

    # An action literal statement
    When I click the button {"#profile-submit-button"}

    # Another literal statement
    When I click the button {"#profile-delete-button"}

```js
// All click button literals share same step
When("I click the button {selector}", (selector) => {
    // The selector variable is passed in running time
    await page.$eval( selector, (ele) => ele.click() );
})
```

Now we use a variable in Step, it is populated by the value specified in Literal in running time. That make the **Step** shared by all click button literals. But it still has some drawbacks.

+ The 1st question is how Step know _"selector"_ is a fridenly variable name? It need to be specified in Literal if the steps were genrated automatically.
+ The value maybe not readable, e.g. a generated id like "#id-ere4433g-submit" ... It doesn't make sense appearing in report.
+ We need iterate multiple values for test looping.

### Pass parameter array with ailas name

    # An action literal statement, specify a general name to parameter
    When I click button {selector: profile_button}
    parameters: [
        {
            profile_button: "#profile-submit-button"
        },
        {
            profile_button: "#profile-delete-button"
        }
    ]

```js
When("I click button {selector}", (selector) => {
    // Use alias name "selector" inside step
    await page.$eval( selector, (ele) => ele.click() );
})
```

We get some benefits if we write Literals like this.

+ Using _{alias: parameter, ...}_ format to declare parameters.
+ The **alias name** will be the argument in relevant Step, e.g. **selector** as the variable of the Step. The more specified **parameter names** only existed in Story files.
+ In the report, the **parameter names** are shown as label, so that the report is meaningful for dedicated test suite. For example, the lable of upper sample could be **"When I click <profile_button=="#profile-submit-button">**. It is quite clear than **When I click the button <selector==#profile-submit-button>"**
+ We can provide multiple values to a set of parameters, in this case this **Phase** will be iterated with the param-array. This is also a way to reuse literals for same actions and verifications.

> **alias** for **parameter** is important to auto generate general Steps and Literals syill keep specific, and reports will be friendly.

> Report lable will use the parameter expression replacing the left word. "When I click **button** {selector}" was presented as "When I click **<profile_button=="#profile-submit-button">**". Is is more clear?

### Access Parameters

+ Paramaters defined on a **Phase** (not for an individule Literal Step).
+ Parameters on **Given** phase are global for whole **Story (Suite)**, or we can say it is defined on Story.
+ Parameter on a **When** block could be accessed only by **Acts** and **Facts** of this phase.
+ Parameters with same names are valid in different **When** phase to stand for different parameters.
+ If parameter names defined in **Given** phase are used again in **When** blocks, they are overriden in that **When** phases.

## Looping by Params-Array

We can loop **Story** or **Phase** by passing an array of value sets, e.g. _[ {values}, {values}, ... ]_. The Story or Phase will be executed multiple times by iterating different values.

### Loop whole story (suite)

If we put the Params-Array on **Given** phase (Actually it is on the top of the Story), the whole story (suite) will be looped. That is reasonable because after the **Given** (start status) changed, all the following **When** phases should be evaluated again.

    Given I have reset service {state: lgoin_role}
    And I open the page with {url: homepage_url}
    Then I can see label {selector: login_label_id} showing text {text: login_label}
    # Here the parameters is not a single value object, it is Params-Array instead
    parameters: [
        {
            login_role: "admin_login",
            homepage_url: "www.website.com",
            login_label_id: "#head-login-label",
            login_label: "Admin"
        },
        {
            login_role: "editor_login",
            homepage_url: "www.website.com",
            login_label_id: "#head-login-label",
            login_label: "Editor"
        }
    ]

The steps could be:

```js
Given("I have reset service {state}", async(state) => {
    // API call to reset server
});

Given("I open the page with {url}", async(url) => {
    await page.goto(url);
});

Then("I can see label {selector} showing {text}", async(selector, text) => {
    const html = await page.$eval(selector, (el) => el.innerHTML);
    expect(html).toBe(text);
})
```

+ Whole story (suite) is looped on **Params-Array**
+ In suite looping, the **When** phases could be nest looping if they are iterated by its Params-Array.
+ The parameters of **Given** phase are global parameters across whole suite, but parameters of **When** are scoped in its phase.

### Loop the When phase

Parameters can also declared for a **When** phase, the scope of these parameters are limited for the **When** phase scope. And Params-Array can loop **When** phase by iterating the value sets.

    When I enter text {text: login_username} to input {selector: login_username_input}
    And I enter text {text: login_password} to input {selector: login_password_input}
    Then I see validation {selector: login_validation} showing {text: login_validation_message}
    And I can see the button {selector: login_submit_button} is disabled
    # Params-Array on "When" pahse
    parameters: [
        {...},
        {...}
    ]

The steps could be:

```js
When("I enter text {text} to input {selector}", async(text, selector) => {
    // call Puppeteer to fill the input
});

Then("I see validation {selector} showing {text}", async(selecttor, text) => {
    //
})

//...
```

+ The **When** phase will be iterated by the Params-Array.
+ The **When** must be **Recyclable** - that means after the phase finished, all the actions and facts could be repeated again. For example, the page was changed after the phase, then we can not repeate same operating again. That phase is not **Recyclable** in this case.
+ If we do need loop a **When** which is not **Recyclable**, we can add **Condition Control** on steps of the phase to make it repeated. (_Explain later_)
+ Looping a **When** phase should take care about next phase working - if it's not the last phase. The value sets should be ordered and the last value set will guarantee continue following phases.

> Looping suite or phase is good when looping is easy. Don't use tricky logic for looping to make test hard to understand. In this case we prefer using independent stories or phases.

> Params-Array with a single member is the equivalent with a signle value object as parameters. 

## Conditional

**Recyclable** could be an issue when we use different value sets loop a suite or phase. Mostly the view will be differently in looping with different value set. Perhaps some actions can not be performed and some facts is not true as we expected and result in can not continue the loop. Of course we can give up looping and use extra stories or phase. But sometimes it is easy to make looping possible by doing a little bit change - adding **Condition** on phases or steps.

### Condition on Step

For example:

    Given I have reset service {state: login_role}
    And I open the page with {url: homepage_url}
    Then I can see label {selector: login_label_id, text: login_label}
    Then I can see tab {selector: system_tab} (login_role==admin_login)
    Then I can not see tab {selector: system_tab} (login_role==editor_login)
    parameters: [
        {
            login_role: "admin_login",
            homepage_url: "www.website.com/",
            login_label_id: "#head-login-label",
            login_label: "Admin"
        },
        {
            login_role: "editor_login ",
            homepage_url: "www.website.com/",
            login_label_id: "#head-login-label",
            login_label: "Editor"
        }
    ]

Parameters in Given phase can be accessed by **condition expression** all over the story. But paramaters in **When** phase can only be accessed by condition expression on this phase (either phase-condition or step-condition).

+ Condition expression is declared in the end of a literal statement in "()".
+ The expression can evaluate parameters of current phase and **Given** phase if current phase is **When** phase.
+ Operators in expression could be Arithmatic, Compare and Logic operators, and the result of the expression **must** be boolean.
+ The step will be skipped (ignored) if the ecpression false.
+ Handow will append the express to the Step function, e.g. ( _[expression]_ ) && test("Then ...", fn)

```js
/* Atually suite is not composed by step directly .... The When describe.each() need pass all values ... */
// Step condition example - after Handow compile steps into Jest code
// Pay attention how to transfer values to parameters with describe.each()
describe.each(["#profile-edit-button", "#profile-edit-form"])("When I click button {profile-edit-button}",
    ( profileEditbutton, profileEditForm ) => {
        beforeAll( async() => {
            // The act to click "profile-edit-button" is only performed when "Admin" login
            // Here the 'loginUsername' parameter is defined in Given phase
            ( loginUsername == "Admin" ) && await page.$eval( profileEditbutton, (ele) => ele.click() );

            // ... other Acts
        });
        // The fact of display "profile-edit-form" is only verified when "Admin" login
        ( loginUsername == "Admin" ) && test("Then I can see the view {profile-edit-form}" async() => {
            // The verification of this fact.
        })

        // ... other facts
});
```

> Jest use a **describe** function wrapping a phase and whole suite (instead of executing Acts and Facts functions in simple flat way). That's why we emphase Phase in Handow. All the parameters are passed to **Phase Block (a describe function)** by _describe.each(value1, value2, ...)(["label1", "label2", ...], (param1, params, ...) => { ... } )_. Another issue is the the literal labels of Acts, Handow pass all Acts labels to the _describe.each_ as stringd separated by ";". In reports, Handow will match labes with each Act function. ????????

> Step condition expression can access parameters of "Given" phase or of current "When" phase. 

### Condition on Phase

Similar with skipping s step, Handow can skip a whole **When** phase by conditional expression.

    # A When phase
    (login_username == "Admin")
    When ...
    parameters: [ {}, {}, ... ]

The consition expression is declared above the phase. After the compiled into Suite, it should be a conditional expression like this:

```js
// Actually skip a phase is simple with skip a step.
// The conditional expression can only access "Given: parameters
( loginUsername == "Admin" ) && describe.each([...])("When I ...", async(...) => {
    // the whole phase code block
})
```

Same as step conditional, the phase condition expression can access parameters of this phase and parameters in story scope.

> **Note** We never put condition on **Given** phase because ignore the Given phase means skip the whole story. Maybe the test flow need skip specific stories in some situations, but Handow will resolve this with Plan or other solutions.

## Skip a phase or a step

Using Handow conditional expression for Phace, Act or Fact steps skipping, e.g.:

    # Skip this phase
    (false)
    When ...
    Then ...

And Handow can recognize 'skip' keyword too:

    # Skip this phase
    (skip)
    When ...
    Then ...

Can also skip steps:

    # Skip specific steps
    When ... (skip)
    Then ... (skip)

**Actually SKIP means IGNORE** in handow. When a phase or step was skipped, the relevant code is not executed by a static conditional logic. So the skipped phases and steps are not appear in report.

We can use **#** to specify a comment line in Literal Story. So we can also comment a step to _skip_ it. But using **#** is not same with **(skip)** technially. The step code is not compiled into suite intead of ignore it in running time.

> Anyway, we can also use **#** comment a step or all steps of a phase. Maybe developer think **#** is better than using **(skip)** conditional.

## New browser instances, reuse instance and open new pages

+ Once start a suite, the first thing is check array **browserInstances** to see if any idle instance existed.
+ If there is one idle instance, use _browser.connect()_ to reused it.
+ If no idle instance, use browser.launch() create a new instance (mostly we create an **Ingodnito** instance).
+ 
