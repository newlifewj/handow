## Tags in a story

If there are a lot of stories, we really want to show them with filter and grouping. For example we want to show all test stories related with **User** entity. That's why we add tags to a story.

There is a default tag manipulated by Handow automatically, the **failed** tag, which will be added to all failed stories.

### How

```
@tags: ["tag1","tag2", ...]
```

@tag must be the first line of a story (above the Given scenario). It is optional.
