# Using ChatGPT Tasks
## 2025-06-03 09:54:19

I saw some video about using ChatGPT tasks. The guys setup a prompt to get the latest AI news and summarize it into a report that he could send to his users.  It made me start thinking about how I could use these _tasks_ in an interesting way.

My first thought was to have it check the performance of my website.  Say grab some url like `https://blog.beguelin.com` and collect stats on that.  I asked ChatGPT if it could do that and of course it agreed that this was a great idea.

So to use tasks you have to use the web version of ChatGPT, you can't use the current Mac or iOS apps.  Ok, that's fine.

You also select the 04-mini model.  I then created a task.  So have a site where I keep track of stats for users that hit the page. I then told ChatGPT to grab that page every 15 minutes and then I waited.  It said it grabbed the page and got some stats.  The page in question is a redirect that I have running on Cloudflare.  It also does logging and renders a little admin page so I can see the stats.  Well ChatGPT didn't hit the page, but it _lied_ about it!  

This was hard to figure out at first because it gave me some reasonable results. It made up response headers and times.  But there was no way my page was returning what it was telling me it was getting.  

Ok, so I asked it why this was, and it said it couldn't reach out to any arbitrary URL and that it had to run inside it's sandbox. But it gets the latest news, right?  And one of the other examples it gives for tasks is generating a sales report. This example is it grabs some stats and then creates a sales report. Well if it can do that, then it can grab my webpage, right?  

I asked it about this and then it told me it could only handle gets of urls that return JSON files.  Ok, so let's try that.  

Ok, so I made /logs.json and ChatGPT did give me a nice report.  


```Here’s a summary based on the current logs from https://casita.dev.pr/logs.json:

🌍 Visitors by Country

Country	Visits
🇺🇸 US	10
🇪🇸 ES	7
🇻🇳 VN	6
🇫🇷 FR	6
🇮🇹 IT	3
🇲🇾 MY	1

⌚ Peak Activity Times

Most visits occurred:
	•	Around 09:00–10:00 UTC
	•	Spikes near 16:00 UTC on multiple days

📱 Top User Agents

User Agent Snippet	Count
Safari on macOS or iOS	14+
curl (CLI tool)	8+
Chrome or WebKit-based (non-curl)	5+
WhatsApp or iOS NetworkingExtension	4+

🌐 IP Versions Used
	•	IPv6: Present (e.g. 2a01:e0a:d30...)
	•	IPv4: Common (e.g. 71.202.86.180, 80.28.123.73)

Let me know if you’d like a CSV export, time series chart, or segmentation by user agent/device.
```

And I see that they identify themselves in the logs:  OAI-SearchBot/1.0


> ```2025-06-02T01:43:48.136Z: {"ip":"104.210.140.133","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36; compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot","country":"US","referer":"unknown","timestamp":"2025-06-02T01:43:48.136Z"}```

Interesting, so we now have an IP address for the OAI bot.  Turns out it comes from an Azue cluster in Texas, at least according to ChatGPT.  

### Bottom Line

### The ChatGPT Tasks don't seem to be consistent.  

One of the tasks that I setup was only supposed to trigger if BTC fell below $100k.  I got an alert that it had fallen below that and was at $67k

<p style="text-align: center;">
  <img src="/assets/btclow.png" alt="BTC Low Graph" width="400" style="max-width: 100%; height: auto;">
</p>


