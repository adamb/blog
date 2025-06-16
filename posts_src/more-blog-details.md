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

Ok, I asked Claude to create the migrate.js script. It wrote something that seemed reasonable using the above text as a prompt. But it didn't paginate through the keys.  I asked it to change the script to paginate.  Also I had to create a .env file with my Cloudflare api token, which I also had to create.  

I then asked it to write a report script that I could run to see the stats.  Now I can run the script and get a report that looks like this:

```bash
% node report.js

📊 Visit Stats Report - PRODUCTION Environment
KV Namespace: 1938ea1eb1184f289d783cbe40148911
============================================================
Fetching path statistics...

Total Visits: 88
Unique Pages: 15

📈 VISITS BY PAGE:
------------------------------------------------------------
Visits | Page
------------------------------------------------------------
    30 | / (34.1%)
     9 | /2025/06/adams-travel-tips/ (10.2%)
     9 | /posts/paris-tips (10.2%)
     7 | /posts/chatgpt-tasks (8.0%)
     6 | /2025/06/build-a-new-blog/ (6.8%)
     6 | /posts/travel-tips (6.8%)
     5 | /posts/startmeup (5.7%)
     4 | /2025/06/failing-chatgpt-tasks/ (4.5%)
     4 | /admin (4.5%)
     2 | /2025/06/paris-travel-tips/ (2.3%)
     2 | /build (2.3%)
     1 | /277273 (1.1%)
     1 | /stats.js (1.1%)
     1 | /stats/foo (1.1%)
     1 | unknown (1.1%)
------------------------------------------------------------
    88 | TOTAL

🏆 TOP 5 PAGES:
1. / - 30 visits (34.1%)
2. /2025/06/adams-travel-tips/ - 9 visits (10.2%)
3. /posts/paris-tips - 9 visits (10.2%)
4. /posts/chatgpt-tasks - 7 visits (8.0%)
5. /2025/06/build-a-new-blog/ - 6 visits (6.8%)

Schema Version: v1
```

Now the stats work and I'm actually using some htmx goodness. :-)

