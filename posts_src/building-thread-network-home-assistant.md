---
title: "Building a Thread network for Home Assistant"
date: "2026-07-24"
slug: "building-thread-network-home-assistant"
---

# Building a Thread network for Home Assistant

Thread is a low-power mesh networking protocol that's becoming the backbone of modern smart homes.   I've always liked the idea of an automated home.  In fact I started a company called Sensr.net that I thought would be part of this ecosystem but we never got there.  

Anyway, I liked the Alexa home automation stuff and still use it along side Home Assistant.  But I'm trying to get off the clould as much as possible so I started replacing all my devices with Thread and HA instead of Wifi and Alexa.  

Why Thread?  It's fast and good for low power.  I wanted to detect doors being opened, because we live on the beach in Puerto Rico I want to keep all the doors to the storage rooms closed.  I ran across the IKEA Thread enabled door sensors so that was the driving use case for me.  Thread is designed for low power and IKEA devices are great, they are cheap and have a big name behind them.  The fact that IKEA is all in on Thread made it very attractive for me.  

Thread is basically like Wi-Fi but on a different radio frequency optimized for low-power devices. Learn more at the <a href="https://www.threadgroup.org/" target="_blank">Thread Group official website</a>.

## What is Thread?

Thread is an IP-based wireless protocol designed specifically for IoT devices. It's built on IEEE 802.15.4 and creates a self-healing mesh network where devices can relay messages through each other to extend range and reliability. Unlike Wi-Fi, Thread is designed for low-power devices that can run for years on batteries.  

The fact that it gives out IPv6 addresses is cool but frankly not something you will deal with at all. I didn't even know this until today, when I was researching this blog post.

## Drawbacks of Thread

It's new so devices are still a little flaky and more expensive than Wi-Fi or Zigbee versions.  I still get excited when I hear about new Thread devices.  I've also made the mistake of buying Matter/Wi-Fi switches thinking that they were _Thread_ so beware.  Just because it says Matter doesn't mean it's Thread.  

It's also a lot of work to make sure you've covered your home properly. But Wi-Fi or Zigbee have the same issues.  

## Getting Started with Thread in Home Assistant

Before you can use Thread devices, you need a Thread border router. This is a device that bridges your Thread network with your home network so Home Assistant can communicate with Thread devices.

### Thread Border Router Options

The <a href="https://www.home-assistant.io/connect/zbt-2/" target="_blank">Home Assistant ZBT-2</a> is the latest border router from the team behind Home Assistant, so that's the one I recommend getting. If you're building a HA system, this is the way to go. You can also build a Thread network using <a href="https://www.apple.com/homepod-mini/" target="_blank">Apple HomePod mini</a> and <a href="https://eero.com/" target="_blank">Eero</a>, but if you're doing HA you should stick with the ZBT-2. It comes with a sturdy little base and a 1.5-meter cable so you can place it away from hardware interference.

<a href="https://www.home-assistant.io/connect/zbt-2/" target="_blank"><img src="/assets/zbt-2.webp" alt="Home Assistant Connect ZBT-2 border router on its base with cable" style="max-width: 100%; height: auto; margin: 10px 0;"></a>


## Adding Your First Thread Device

Once your border router is set up, adding Thread devices to Home Assistant is straightforward. Use the Home Assistant Companion app (<a href="https://apps.apple.com/us/app/home-assistant/id1099568401" target="_blank">iOS</a> or <a href="https://play.google.com/store/apps/details?id=io.homeassistant.companion.android" target="_blank">Android</a>). You scan a QR code on the device and this tells Matter the details. Your phone then talks BLE to the device and sends over the network info. Mostly this works, seamlessly. I did have an issue at one point where my iPhone didn't have the right creds for some reason. I spent a lot of time trying to get my iPhone to re-sync with HA. There have been a lot of updates to the iOS app and HA since then, so hopefully these gotchas are worked out.

## Common Thread Devices

Popular Thread-enabled devices include:

- **Lighting**: <a href="https://www.philips-hue.com/" target="_blank">Philips Hue</a> (newer models)
- **Switches & Outlets**: <a href="https://www.evehome.com/" target="_blank">Eve Energy</a>
- **Sensors**: <a href="https://www.evehome.com/" target="_blank">Eve Motion &amp; Eve Door/Window</a>


## Building a Reliable Thread Network

One of the more challenging parts of my Home Assistant setup wasn't Wi-Fi, it was building a reliable Thread network.

Thread works extremely well once it's configured properly, but it's very different from Wi-Fi. You can't just add a few battery-powered sensors and expect everything to work. Coverage and network topology matter.

## My Hardware

My setup is based on:

- **<a href="https://green.home-assistant.io/" target="_blank">Home Assistant Green</a>**
- **<a href="https://www.home-assistant.io/connect/zbt-2/" target="_blank">Home Assistant ZBT-2</a>** USB radio configured as a **Thread Border Router**

The ZBT-2 supports both Zigbee and Thread, but I'm using it exclusively for Thread. Be sure it's flashed and configured appropriately for your intended use.

## The Biggest Lesson: Battery Devices Don't Extend the Network

The most important thing I learned is that **battery-powered Thread devices are endpoints, not repeaters**.

If your network only consists of battery-powered sensors, your Thread mesh won't grow very far.

To build a strong mesh, you need **mains-powered Thread devices**, which act as Thread Routers and extend coverage throughout the house.

## Devices That Worked Well

### <a href="https://inovelli.com/" target="_blank">Inovelli White Series Switches</a>

These became the backbone of my Thread network.  The hardware is top notch and has lots of cool options for automations.  You can do gestures like 'double tap' either on up or down padels.  It has an LED bar that you can program for status. I have mine at the front door flash red if the gate is left open for too long...

Because they're permanently powered, they act as Thread Routers and create a solid mesh. Since light switches are naturally distributed throughout the house, they make excellent infrastructure devices.

Highly recommended if you're wiring a new house or replacing switches anyway.

### <a href="https://www.evehome.com/" target="_blank">Eve Switches</a>

I also installed several Eve Thread switches.  They are simpler than the Inovelli, but pretty sold as Thread routers.

Like the Inovelli switches, the Eve switches are mains-powered and strengthen the mesh. They integrated cleanly into Home Assistant and have been very reliable.

### <a href="https://www.amazon.com/Onvis-Matter-Thread-Outlet-Google/dp/B0FRFPV5FK" target="_blank">Onvis Thread Smart Plugs</a>

These turned out to be incredibly useful.

They're inexpensive, easy to move around, and can be plugged into different locations while you're experimenting with coverage.

When I found a weak spot in the network, I could simply move one of the smart plugs to reinforce that area.

They're probably the fastest and easiest way to improve a Thread network without changing wiring.  However, I have had one fail in the first few months and another one seems to be flakey.  I might need to try another brand.  I use one to control my yard lights and another one to control a dehumidfier.  

### <a href="https://www.smartwingshome.com/pages/work-with-matter-over-thread" target="_blank">Smartwings Roller Shades</a>

I've had great success with Smartwings Matter over Thread roller shades.

They're battery powered and connect easily into Home Assistant. I can control them from automations or manually via HA, which is a nice bonus.  I installed them without the guide wire, and so it's important that they are not down when the wind is up.  I use the ECOWITT weather station to monitor the wind and put the shads up if it's too windy.  

TODO: link ECOWITT to this url https://www.amazon.com/dp/B0BM3BQ425 

### <a href="https://www.ikea.com/" target="_blank">IKEA Thread Devices</a>

Once the backbone of the mesh was in place, I started adding battery-powered Thread devices. These are my favorite devices:

- <a href="https://www.ikea.com/us/en/p/myggbett-door-window-sensor-smart-60617641/" target="_blank">MYGGBETT Door/Window Sensor</a>
  <a href="https://www.ikea.com/us/en/p/myggbett-door-window-sensor-smart-60617641/" target="_blank"><img src="/assets/myggbett.jpeg" alt="MYGGBETT Door/Window Sensor" style="max-width: 200px; margin: 10px 0;"></a>
- <a href="https://www.ikea.com/es/en/p/myggspray-wireless-motion-sensor-smart-70604186/" target="_blank">MYGGSPRAY Wireless Motion Sensor</a>
  <a href="https://www.ikea.com/es/en/p/myggspray-wireless-motion-sensor-smart-70604186/" target="_blank"><img src="/assets/myggspray.jpeg" alt="MYGGSPRAY Wireless Motion Sensor" style="max-width: 200px; margin: 10px 0;"></a>
- <a href="https://www.ikea.com/us/en/p/bilresa-remote-control-white-smart-dual-button-80617876/" target="_blank">BILRESA Remote Control with Dual Button</a>
  <a href="https://www.ikea.com/us/en/p/bilresa-remote-control-white-smart-dual-button-80617876/" target="_blank"><img src="/assets/bilresa-dual-button.jpeg" alt="BILRESA Remote Control with Dual Button" style="max-width: 200px; margin: 10px 0;"></a>
- <a href="https://www.ikea.com/us/en/p/bilresa-remote-control-white-smart-scroll-wheel-70617457/" target="_blank">BILRESA Remote Control with Scroll Wheel</a>
  <a href="https://www.ikea.com/us/en/p/bilresa-remote-control-white-smart-scroll-wheel-70617457/" target="_blank"><img src="/assets/bilresa-scroll-wheel.jpeg" alt="BILRESA Remote Control with Scroll Wheel" style="max-width: 200px; margin: 10px 0;"></a>

These have worked well, but only because the underlying mesh was already strong.

## Fun with BILRESA Automations

I use the BILRESA remote as a bedside companion to control the lights and the ACs.  It's one of the few automations my wife acutally uses.  Press and hold on the buttons will raise or lower the temp on the AC (and softly announces the new temp on a bedroom speaker).  Single tap on the top buttton turns off the bedroom lights.  The bottom button turns off the adjacent bathroom lights.  Finally double tap on either of them will turn the AC on or off.

## Coverage Was Harder Than Expected

My house has concrete walls and reinforced concrete construction.

Those same materials made Wi-Fi difficult, I ended up deploying six Wi-Fi access points throughout the property.

Thread faced many of the same challenges.

Just because Thread is a mesh protocol doesn't mean coverage is automatic. Radio signals still have to penetrate walls, and concrete with rebar is particularly difficult.

I ended up thinking about Thread coverage much like Wi-Fi coverage:

- Place powered devices throughout the house.
- Fill dead spots with additional routers.
- Test, adjust, and repeat.

The difference is that instead of adding Wi-Fi access points, you're adding Thread Routers.

## My Advice

If you're starting a Home Assistant Thread network:

1. Start with a proper Thread Border Router.
2. Plan for mains-powered Thread devices throughout the house.
3. Use smart plugs as movable "mesh extenders" while tuning coverage.
4. Add battery-powered sensors only after the mesh is solid.
5. Expect to spend some time optimizing placement, especially in homes with concrete walls.

## Final Thoughts

Once everything was in place, the network became extremely stable and super fast.

The biggest mistake people make is treating Thread like Wi-Fi or Zigbee and expecting a few battery devices to magically create a mesh.

Think of mains-powered devices as the infrastructure and battery-powered devices as the clients. Build the infrastructure first, and everything else becomes much easier.


## Troubleshooting Tips

You typically don't add a naked Thread device. Thread is the communication layer, but typically devices will use Matter to connect to your system at a higher level.

It's really Matter that matters. It's the application layer that you see. The Thread stuff is mostly hidden from the user. When you add a Matter/Thread device, you scan a QR code using the HA companion app, this is the iOS or Android app. The phone then uses its bluetooth interface to configure the underlying Thread radio in the device. Mostly this works until it doesn't. *Be very careful when clicking around in the HA Thread Border Router section. Resetting the ZBT-2 can result in having to re-add all your thread devices, which can be quite painful.*

I made this mistake fairly early on and had to redo all my devices. Currently I have about 30 Thread devices. I would not want to have to reset all of these.  

