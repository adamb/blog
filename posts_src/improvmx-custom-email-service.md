---
title: "ImprovMX: Crazy flexible email"
date: "2025-06-17"
slug: "improvmx-crazy-flexible-email"
---

# ImprovMX: Crazy flexible email

[ImprovMX](https://improvmx.com) is a really great service for setting up your email forwarding.  I've been using the service for a couple years now.  

I had been using MailHop Forward and it worked ok.  I had some problems with them bouncing emails that were important to me, so I was looking for an alternative and found ImprovMX.  

## Why do I like it?

First off, it's dead simple to set up. You just add a few DNS records (an MX and a TXT) and you're good to go. No need to mess with a full-blown mail server or mess around with cPanel or Google Workspace if all you want is to receive email at your domain.

Second, it's fast. I’ve never noticed any delay in forwarded mail — it shows up almost instantly in my inbox. 

Third, it's reliable. I haven’t lost a single email since switching.  

Finally, it lets me manage all the aliases for all my domains in one dashboard. I can set up `hi@domain.com` and `support@anotherdomain.com` and forward them wherever I want, all from the same account.

I use gmail as my main email reader.  So all my emails end there and I can filter on the address that it was sent to if I want to focus on email from a particular domain. 

## What does it cost?

ImprovMX has a free plan that lets you forward up to one domain and unlimited aliases. If you want to use a custom domain for sending or need more advanced features like email logs, catch-all forwarding, or priority support, the paid plans start at around $9/month.

For small projects or side hustles, the free tier might be all you need.

## Can it send email?

Yes — with a catch.

You can configure ImprovMX to send mail using your domain, but technically it works through an SMTP relay (like Gmail, SendGrid, Mailgun, etc.). ImprovMX helps you generate the right DNS records (SPF, DKIM) to make sure outgoing emails don’t end up in spam.

So while ImprovMX itself doesn’t run an outbound mail server, it plays nicely with other services so your domain can send emails too.

If you need to send email programmatically, I recommend [DuoCircle](https://www.duocircle.com/email/outbound-smtp), they have a REST api that you can use to send email. It's 100x easier to setup than Amazon SES, which sucks in my opinion.  But that's another blog post.    


## Gmail alias trick

One cool tip if you're using Gmail as your main inbox: Gmail lets you add a `+something` to your email address. So if your address is `you@gmail.com`, you can use `you+newsletter@gmail.com`, `you+test@gmail.com`, or `you+whatever@gmail.com` — and all those emails will still land in your inbox.

This works great with ImprovMX because you can forward emails to your main Gmail address, then use filters or labels based on the `+` alias. It’s a handy way to sort incoming messages or track where an email address was used.

