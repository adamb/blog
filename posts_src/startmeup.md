---
title: "Build a new blog"
date: "2025-06-02"
slug: "build-a-new-blog"
---

# Start Me Up:  Build a new blog

I keep coming up with things I want to write up but don't really have a place to put them.  I tried using Hugo for a while and did't like it.  Back in 2007 I was using Blogger and that just seems way too old.

I'm rolling my own now.  Using HTMX and a little javascript and hosting it at Cloudflare.  This seems like the right thing and it fits my brain.  Let's see how it goes.

You can find the source code for this blog on my git repo: https://github.com/adamb/blog


## Day Two
### 2025-06-03 09:40:25

Ok, nothing is as simple as you might think.  So I have a build.js script and that's working.  But the pages that were built are just html pages, so it's not really doing anything to use the htmx verus html.  

I'm using htmx in the main page and originally it was cool to have it pull in the snippets of html for each post. But then the direct links to those posts didn't get rendered with the style sheet.  Now the html pages are full pages, and the main page pulls them in and uses `hx-select` to pull the `<article>` out of the html page.  

Now I'm not sure why I'm using htmx at all.  I guess to learn something new.  

I'm thinking of adding some stats too.  I could add a /track script that would invoke a Cloudflare tracking function to stick stats into a kv and then build a little stats dashboard.

Anyway, for now I have some place to keep track of ideas.  

Next steps:

- Add some more posts
- Get tracking and stats to work
- Figure out if it's worth using htmx







