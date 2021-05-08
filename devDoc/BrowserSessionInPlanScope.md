# Share Browser Session In Plan Scope

When we run a story solely, it always use a new browser context with new **browser session**. That means all the data like cookies, cache ... are cleared. That is good. Actually we run the story by wraping it in a plan.

However, mostly we don't want every story in a plan use a new **browser session** (except there is only one story in the plan). **Inheriting Browser Session** is the actual scenario when user use browser to access most applications. For example, the test user signed in on the app in one story, and the following stories should not sign in again ...

How to fix this:

+ The is a config item - _browserSessionScope_. The default value is **plan**, but user can change it to **story**.
+ If _browserSessionScope !== 'story'_, the browser is launched in plan scope, and every story access this browser instance for test. And the browser context is closed when plan finished.
+ If _browserSessionScope === 'story'_, the browser is launched in every story and closed in the end of every story.


