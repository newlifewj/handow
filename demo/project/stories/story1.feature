## ----------- Simple story to design literal syntax ------------
## A phase must start with "@scenario: ..." or "@phase: ..."

# Given phase and story level looping
@scenario: Start to go to homepage
Given I have opened url {url: "HomepageURL"}
And I have seen it {selector: "Homepage"} is displayed @skip: (false)
Then I can see it {selector: "PageHead"} is showing html {html: "HeadHtml"}
And I can see it {selector: "Page_Head"} is showing text {text: "Head_Text"}
And I can see it {xpath: "Page_Head"} is showing text {text: "Head_Text"}

@parameters: [
    {
        HomepageURL: 'https://localhost:8080',
        Homepage: "#petlist-component-table",
        PageHead: "#logo-head span",
        HeadHtml: "Pet Store Online English <i>1.0</i>",
        Page_Head: "logo-head-title@h4w",
        Head_Text: "Pet Store Online English 1.0"
    },
    {
        HomepageURL: 'https://localhost:8080',
        Homepage: "#petlist-component-tableXXX",
        PageHead: "#logo-head span",
        HeadHtml: "Pet Store Online English <i>1.0</i>",
        Page_Head: "logo-head-title@h4w",
        Head_Text: "Pet Store Online English 1.0"
    }
]
        
# When phase, looping and conditional, @scenario is same as @phase
@scenario: Access the Gallery view
@skip:   ("#petlist-component-tableXXX"===this.Homepage)
When I click it {selector: "MainTab"}
And I do nothing @skip: (this.Page_Head==="logo-head-title@h4w")
And I wait it {selector: "GalleryItem"} is displayed 
And I wait time {seconds: "WaitingTime"} seconds @skip: (this.GalleryItem==="#gallery-item-49")
Then I can see it {selector: "FooGallery"} is displayed
@parameters: [
    {
        MainTab: "main-tab-gallery@h4w",
        GetGalleries: "https://api.soundcloud.com/users/8665091/favorites",
        GetGalleriesSuccess: 200,
        GalleryItem: "#gallery-item-30",
        FooGallery: "#gallery-item-70",
        WaitingTime: 5
    },
    {
        MainTab: "main-tab-gallery@h4w",
        GetGalleries: "https://api.soundcloud.com/users/8665091/favorites",
        GetGalleriesSuccess: 200,
        GalleryItem: "#gallery-item-49",
        FooGallery: "#gallery-item-50",
        WaitingTime: 3
    }
]

