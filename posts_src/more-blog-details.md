---
title: "More Blog Details"
date: "2025-06-16"
slug: "more-blog-details"
---

# More Blog Details


I was looking at how Blogger does the listing of the blogs and I actually like it.  So I decided to change the blog code to show the posts by date.  And I also wanted to figure out how to make it render better on mobile, but that's still a work in progress.  

I'm still not using htmx really.   But I do have stats that I'm keeping.  So I realized that I can use htmx for that.  I want to put a reader count on each blog entry.  My current stats are kept in a kv and you can see them on the [stats page](/stats) but this kv keeps the stats by date, using the key `visit:${now}`.  So to compute the stats for a particular page, I would need to process all the stats in the kv.  This would take too long.  So let's update the kv to also keep track of the stats per page.  We need another key type, so `path:${path}` seems sensible.

But now we have the problem that the stats so far will be left out of this computation.  So we need to have a migrate script.  But if the migrate script is run more than once, it might mess up the stats.  So we should add a version key too.   Let's use the key `schema_version` and then check that.  On the first migration there will be no `schema_version` so we will set it to `v0` if the key doesn't exist.  Then go through and compute the `path:${path}` keys and set them to a count that we find under the `visit:` keys.  

Once that is done, then try to use htmx to pull the count for each visit.  