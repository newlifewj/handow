## Test the stage dashboard

@scenario: Start enter the report page
Given I have opened url {url: "LocalDemoURL"}
# And I have seen it {selector: "LogoTitle"} is displayed
Then I can see it {selector: "StageTitle"} is displayed
@parameters: [
    {
        StageTitle: 'summary-stages-title@h4w'
    }
]

@scenario: Enter story detail view
When I click it {selector: "Story"}
And I have seen it {selector: "StoryDetail"} is displayed
# And I click it {selector: "ExpandStoryParams"}
Then I can see it {selector: "StoryParams"} is disappered
Then I can see it {selector: "StoryParams"} is displayed
@parameters: [
    {
        Story: "summary-story-name@h4w",
        StoryDetail: ".cpnt-story-details",
        ExpandStoryParams: "story-params-show@h4w",
        StoryParams: "story-params@h4w"
    }
]

@scenario: Open story parameters1
# When I click button {selector: "ParamsToggleHideButton"}
When I click it {xpath: "Params_Toggle_Show_Button"}
# When I click it {selector: "ExpandPhaseParams"}
And I click it {selector: "ExpandStoryParams"}
# And I click button {selector: "ParamsToggleShowButton"}
Then I can see it {selector: "StoryParams"} is displayed
@parameters: [
    {
        ExpandStoryParams: "story-params-show@h4w(1)",
        # ExpandStoryParams: "*[h4w=story-params-show]:nth-child(1)",
        # Params_Toggle_Show_Button: "(//*[@h4w='params-show-hide-toggle' and contains(., 'Show Parameter Values')])[1]",
        Params_Toggle_Show_Button: "params-show-hide-toggle@h4w('Show Parameter',1)",
        StoryParams: "story-params@h4w"
    }
]

@scenario: Expand a phase
When I click it {xpath: "Access_Gallery_View_Phase_Title"}
When I wait time {seconds: "WaitTime"} seconds @skip: ("params-show-hide-toggle@h4w('Show Parameters',1)"==this.Params_Toggle_Show_Button)
Then I can see it {selector: "StepTitle"} is displayed
@parameters: [
    {
        # Wildcard path, wildcard element, only with probe constraint and content
        # AccessGalleryViewPhaseTitle: "//*/*[@h4w='phase-title' and contains(., 'Access the Gallery view')]",
        Access_Gallery_View_Phase_Title: "phase-title@h4w('Access the Gallery view')",
        StepTitle: "step-title@h4w",
        WaitTime: 1
    }
]

@scenario: Expand the XHR testing phase
When I click it {xpath: "Test_XHR_Phase_Title"}
When I wait time {seconds: "WaitTime"} seconds @skip: ("params-show-hide-toggle@h4w('Hide Parameters',1)"==this.Params_Toggle_Show_Button)
Then I can see it {xpath: "XHRStepTitle"} is displayed
@parameters: [
    {
        Test_XHR_Phase_Title: "phase-title@h4w('Test XHR communications')",
        XHRStepTitle: "step-title@h4w('And I received response with GetVersionData')",
        WaitTime: 1
    }
]

@scenario: Open XHR record dialogue popover
When I click it {selector: "Open_XHR_Icon"}
Then I can see it {selector: "XHR_Detail_Panel"} is displayed
@parameters: [
    {
        Open_XHR_Icon: "open-xhr-entry@h4w",
        XHR_Detail_Panel: ".XHRDetail__xhrpanel___38xQW"
    }
]