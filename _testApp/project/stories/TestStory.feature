@tags: ["google"]
@scenario: Navigate to Google Search
Given I have opened {url: "Google_Search"}
And I wait all pending requests resolved
Then I can see {selector: "An_Image"} presented
@parameters: [
    {
        Google_Search: "https://www.google.ca/",
        GG_Search_Html: "temp/ggSearch.html",
        An_Image: "//img"
    }
]

@scenario: Navigate to Google Translate
When I go to {url: "Google_Translate"}
And I wait all pending requests resolved
Then I can see {selector: "Translate_Box"} presented
And I can see the input {selector: "Translate_Box"} value equals {text: "Source_Word"}
@parameters: [
    {
        Google_Translate: "https://translate.google.ca/?sl=en&tl=fr&text=synonym&op=translate&hl=en",
        Translate_Box: "//textarea[@aria-label='Source text']",
        Source_Word: "synonym"
    }
]