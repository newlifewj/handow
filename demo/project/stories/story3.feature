## ----------- Simple story to design literal syntax ------------

# Given phase and story level looping
@scenario Start to go to homepage
Given I have opened url {url: "HomepageURL"}
And I wait all pending requests resolved in seconds {seconds: "PendingRequestWaiting"}
And I have seen it {selector: "Homepage"} is displayed @skip: (false)
Then I can see it {selector: "PageHead"} is showing html {html: "HeadHtml"}
@parameters: [
    {
        HomepageURL: 'https://localhost:8080',
        Homepage: "#petlist-component-table",
        PageHead: "#logo-head span",
        HeadHtml: "Pet Store Online English <i>1.0</i>",
        PendingRequestWaiting: 5
    },
    {
        HomepageURL: 'https://localhost:8080',
        Homepage: "#petlist-component-tableXXX",
        PageHead: "#logo-head span",
        HeadHtml: "Pet Store Online English <i>1.0</i>",
        PendingRequestWaiting: 0
    }
]

# When phase, looping and conditional
@phase: Access the Gallery view
# @skip:   ( this.Homepage==="#petlist-component-tableXXX")
When I click it {selector: "MainTab"}
And I do nothing @skip: (this.GalleryItem==="#gallery-item-30")
And I wait it {selector: "GalleryItem"} is displayed 
And I wait time {seconds: "WaitingTime"} seconds @skip: ("#gallery-item-49"===this.GalleryItem)
Then I can see it {selector: "FooGallery"} is displayed
@parameters: [
    {
        MainTab: "#main-tab-gallery",
        GetGalleries: "https://api.soundcloud.com/users/8665091/favorites",
        GetGalleriesSuccess: 200,
        GalleryItem: "#gallery-item-30",
        FooGallery: "#gallery-item-70",
        WaitingTime: 3
    },
    {
        MainTab: "#main-tab-gallery",
        GetGalleries: "https://api.soundcloud.com/users/8665091/favorites",
        GetGalleriesSuccess: 200,
        GalleryItem: "#gallery-item-49",
        FooGallery: "#gallery-item-50",
        WaitingTime: 0
    }
]

@phase: Test XHR communications
When I send request xhr {xhr: "GetVersionAPI"}
Then I received response with status {status: "HTTP200"} HTTP status
And I received response with data {data: "GetVersionData"}

@phase: Test 404 XHR
When I send request xhr {xhr: "WrongURLAPI"}
Then I received response with status {status: "HTTP404"} HTTP status
And I received response with data {data: "WrongURLResponse"}


