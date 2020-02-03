# Phase Micro - reuse a common phase in all stories

Steps are reused in all stories in code level. Sometimes we want reuse phase in literal level - reuse a group of steps. E.g. a button existed in different pages but click it will go to same view. We have to repeat an exactly same test phase in different story, that is boring.

## Define a phase as micro

We just need tag a phase as micro in a story instead of writing a misro definition file. Handow will handle this automatically.

    # Use @scenario-micro or @phase-micro instead of @scanario/@phase
    @scenario-micro: Click the Message Stream button (micro)
    @skip ("stop" !== MessageOutputMode)
    When I click it {selector: "#btn-msg-stream"}
    And I wait it {selector: "#box-msg-stream"} is displayed
    Then I can see it {selector: "#title-msg-title"} is displayed
    Then ...
    ...
    @parameters: [
        ...
    ]

Phase with tag _@scenario-micro_ or _@phase-micro_ are still normal phases when Handow run them it their story, just like _@scenario_ or _@phase_. But Handow will scan all stories to gather them before test running, and then populate the **micro references** in running time.

> The config control using mico or not, _**config.enablePhaseMicro===true | false**_.

## Refer a micro as phase

If we want repeat a micro in other stories (have known it existed)

    # Use @micro tag to refer a micro by label matching
    @micro: Click the Message Stream button (micro)
    @skip (...)
    @parameters: [...]

Then the micro phase is referred in running time, just as copy those steps to the refer point.

**Important:**

+ Refer a micro also get the @skip and @parameters definitions. But you can override them by adding new @skip or @paramters.
+ Pay attention to the story global parameters. The refered mico doesn't work if the data env changed.

## Micor - ??? necessary ???