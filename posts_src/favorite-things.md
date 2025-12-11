---
title: "Some of my favorite things"
date: "2025-12-11"
slug: "adams-favorites"
draft: false
---

# Stuff I like

![Uptime Kuma Dashboard](/assets/kuma-screenshot.png)

It's rare that things really give you joy.  But when they do, it's fun to share them. 

So I'm going to start putting together a list of things that I like. 

# Today's joy: _Uptime Kuma_ a software package.

As I was having my coffee this morning, I started thinking about how I might want to monitor a new website that I just built. I asked my friend ChatGPT and the first thing it suggested was [Uptime Kuma](https://github.com/louislam/uptime-kuma), which I had not heard of. I have my own little Debian Linux box at my house and ChatGPT knows that. So it suggested that I just run a Docker command and get Uptime Kuma going. So I did. It was a nice little joyous experience.

So what is Uptime Kuma? It's a software package for monitoring other web pages. And it's free, it's open source, and it just works. With a single Docker command I was able to get it up and running and add monitoring for a few websites that I care about.

So Uptime Kuma will basically go and get a web page or that sort of thing, every minute or so and if the web page doesn't load or it has some problems then it will send you an alert. So that brings up the next problem, how do I get the alert? I thought about emails of course. But then I won't know until I check my email, which doesn't happen that often these days. 

# Pushover.net, the perfect companion

So that brings me to another thing that I really like, which is [Pushover.net](https://pushover.net). Pushover is a really cool service where you can install an app on your phone and then set up alerts to be pushed to your phone for whatever reason you want. I've been using Pushover I guess for over a year. It has a one-time purchase cost, which is very reasonable. I used it for a website that I was creating about a year or so ago. And I also use it now to monitor things at my house like water tanks or freezer temperature or humidity. 

I was very happy to see that Kuma supports Pushover natively, so I just had to go to my Pushover account and add a new app token. 

So in maybe 30 minutes I had a really cool monitoring site set up and events sent to my phone if any of my favorite websites went down.

Kuma also has a status page which you can set up so that anybody can check status of whatever you're monitoring with Kuma. [Here's mine](https://kuma.dev.pr/status/codepr).

This gets to the third thing I want to talk about in my favorite things list, which is [Cloudflare tunnels](https://www.cloudflare.com/products/tunnel/). If you haven't tried Cloudflare tunnels and you're a dev, you really should play with them. A Cloudflare tunnel allows you to set up access to machines no matter where they are. For me, I have machines inside my house, which has a firewall, and of course I don't want to open holes in my firewall and have to deal with all that hassle. 

With the Cloudflare tunnel, you just run a daemon, cloudflared, on your machine and connect it back to your Cloudflare account. And so I have, for instance, that machine kuma.dev.pr above is my Linux box at my house. And the Cloudflare tunnel gives me a secure connection from wherever you are when you're looking at my status page to a machine that's inside of my firewall, inside of my house. 

# Today's favorite toys

- [Uptime Kuma](https://github.com/louislam/uptime-kuma)
- [Pushover.net](https://pushover.net)
- [Cloudflare tunnels](https://www.cloudflare.com/products/tunnel/)
