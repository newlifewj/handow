## ----------- Simple story to design literal syntax ------------

# Given phase and story level looping
@scenario Start to go to homepage
Given I have opened url {url: "HomepageURL"}
And I have seen it {selector: "Homepage"} is displayed @skip: (false)
Then I can see it {selector: "PageHead"} is showing html {html: "HeadHtml"}
@parameters: [
    {
        HomepageURL: 'https://localhost:8080',
        Homepage: "#petlist-component-table",
        PageHead: "#logo-head span",
        HeadHtml: "Pet Store Online English <i>1.0</i>"
    },
    {
        HomepageURL: 'https://localhost:8080',
        Homepage: "#petlist-component-tableXXX",
        PageHead: "#logo-head span",
        HeadHtml: "Pet Store Online English <i>1.0</i>"
    }
]
        
# When phase, looping and conditional
@phase: Access the Gallery view
@skip:   ( this.Homepage==="#petlist-component-tableXXX")
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