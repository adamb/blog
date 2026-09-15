---
title: "My Bots Died Because Tailscale Left the Lights On"
date: "2026-09-15"
slug: "grok-bots-died-tailscale-magicdns"
---

# My Bots Died Because Tailscale Left the Lights On

This morning every Grok Bot I already had started answering with the same shrug: *Bot failed to respond. Something went wrong while generating the reply.*

Not one. All of them.

So I did the chaotic thing that sometimes works. I spun up a brand-new bot — "New Bot" — as a canary. That one talked. Messaging the other bots still *delivered*. They just never answered. The shared computer felt half-alive. Update Grok Bot's Computer didn't resurrect the old ones.

New Bot also confirmed what I'd half-known: all of these agents share one computer. Same filesystem. Same tools. Separate desktops. So it wasn't "new bot on a different machine." Same sick box, different patient who could still speak.

Yesterday I'd been trying to point a bot at my Tailscale exit node — so Grok Bot traffic would look like it came from the house. That's a solid hack when it works. Masquerading as the user's home network is exactly the kind of trick this stack should make easy. It just didn't stick.

## What New Bot found

On the shared computer, `/etc/resolv.conf` had been overwritten by Tailscale MagicDNS:

```
nameserver 100.100.100.100
search tail1df8a8.ts.net
```

And `tailscaled` was **not** running. Stale sock. Connection refused.

So every hostname lookup hung. Raw IP HTTPS still worked. Classic "DNS is dead, IP is fine." Chat could limp. Anything that needed real name resolution face-planted.

## The fix

Restore resolv.conf to boring public DNS:

```
nameserver 1.1.1.1
nameserver 8.8.8.8
```

`box-doctor` went from egress FAIL to all green. The old bots came back.

## Is there a proper way?

Yes. Cursor documents private-network reach for Grok Bot here: https://cursor.com/docs/grok-bot/private-networks

Two official patterns:

1. **Route egress through this desktop** (Settings → Computer) — traffic leaves via *your* machine's IP. Closest to "masquerade as home" without installing Tailscale on the shared box.
2. **Tailscale + exit node via Team Setup** — Enterprise only. Install Tailscale on team computers, authenticate, route through an exit node inside your network.

Tailscale's own exit-node docs: https://tailscale.com/docs/features/exit-nodes (advertise on the home box → approve in admin → `tailscale set --exit-node=<ip>` on the client).

And the DNS footgun is documented too: https://tailscale.com/docs/reference/faq/dns-resolv-conf

MagicDNS + `--accept-dns` + no DNS manager ⇒ Tailscale overwrites `/etc/resolv.conf` with `100.100.100.100`. The proper mitigations are use **systemd-resolved** so Tailscale cooperates instead of clobbering, or per-device `tailscale set --accept-dns=false`. Leaving MagicDNS pointed at a dead `tailscaled` is a known failure mode — unclean stops leave the Magical nameserver behind and hostname lookups hang while raw IP still works. Same shape as today's outage.

So the *goal* (egress from home) is a real product path. The *hack* of MagicDNS without a live daemon is a Tailscale footgun, not a Cursor feature.

## The meta part I like

Starting a fresh bot got me *partial* functionality — enough to investigate. Telling that new bot the suspicion ("maybe Tailscale from yesterday") is what unlocked the fix. Not a dashboard. Not a reboot ritual. A canary plus a hunch.

Tailscale exit-from-home is still a good idea. I'd love it to work reliably so Grok Bot can truly masquerade as me from Finca Del Mar. Just don't leave MagicDNS pointing at a daemon that isn't there.

Lesson, carved small: if you overwrite resolv.conf for a VPN, make sure the VPN is actually up. Otherwise you've invented a very elegant way to hang every DNS lookup on the machine.
