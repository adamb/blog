---
title: "Thoughts on Programming Languages"
date: "2025-09-17"
slug: "thoughts-on-programming-languages"
---

# Should I Learn Rust?

I have a WhatsApp group for our Holberton grads and one grad was talking about learning Rust.  Another grad commented that he's actively looking for jobs and rarely sees Rust as a requirement.  It made me think and I wrote up this response which I thought was worth turning into a post.

It’s good to think about what languages will get you jobs. But it’s also good work on things that interest you.  If Rust sparks your interest, there is a better chance you’ll dig into it and get good at it.  This is the *Build it and they will come* philosophy.  

So if you like Rust, spend some time on it. But realize that the job market is smaller.  Smaller isn’t always bad.  If there are fewer Rust developers, then maybe there is also less competition for jobs coding in Rust….

I spent a while playing with Go and liked it a lot.  C was the first language I loved and Go is very similar.  I like Go because it’s efficient and compiles down to an executable that you can just move around.  No need to worry about a bunch of environment setup.  

Also look at tooling around the language.  I liked Ruby a lot but then got trapped by all the tooling to run it.  Keeping all the versions up to date or consistent was a big pain.  It eventually killed the company that I built on top of it because I couldn’t deal with updating the software under it.  But Ruby is also a fun and elegant language.

Also think about the fact that once you have deployed something, like a product or a website, how much work it will be to maintain that.  We built [Sensr.net](https://sensr.net) on Ruby and Linux and it ran over a decade.   What killed it was the SSL standard moved ahead and the libraries and software we used were so out of date that I couldn’t move the stack to a new version of Linux that had the latest SSL.  We were storing the underlying data on AWS S3 and S3 stopped supporting the version of SSL we had. Interesting lesson!

# Get Involved

I started looking at Golang because I was interested in static site generators and was 
using [Hugo](https://gohugo.io) for blogging.  I got involved for a while in the Hugo community and that was interesting and useful.  Again, this is part of following your interest.  Don't be shy about getting involved in the support communities around the tools or languages you are learning or exploring.  Who knows, it could lead to a job!
