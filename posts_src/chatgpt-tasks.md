# Using ChatGPT Tasks
## 2025-06-03 09:54:19

I saw some video about using ChatGPT tasks. The guys setup a prompt to get the latest AI news and summarize it into a report that he could send to his users.  It made me start thinking about how I could use these _tasks_ in an interesting way.

My first thought was to have it check the performance of my website.  Say grab some url like `https://blog.beguelin.com` and collect stats on that.  I asked ChatGPT if it could do that and of course it agreed that this was a great idea.

So to use tasks you have to use the web version of ChatGPT, you can't use the current Mac or iOS apps.  Ok, that's fine.

You also select the 04-mini model.  I then created a task.  So have a site where I keep track of stats for users that hit the page. I then told ChatGPT to grab that page every 15 minutes and then I waited.  It said it grabbed the page and got some stats.  The page in question is a redirect that I have running on Cloudflare.  It also does logging and renders a little admin page so I can see the stats.  Well ChatGPT didn't hit the page, but it _lied_ about it!  

This was hard to figure out at first because it gave me some reasonable results. It made up response headers and times.  But there was no way my page was returning what it was telling me it was getting.  

Ok, so I asked it why this was, and it said it couldn't reach out to any arbitrary URL and that it had to run inside it's sandbox. But it gets the latest news, right?  And one of the other examples it gives for tasks is generating a sales report. This example is it grabs some stats and then creates a sales report. Well if it can do that, then it can grab my webpage, right?  

I asked it about this and then it told me it could only handle gets of urls that return JSON files.  Ok, so let's try that.  