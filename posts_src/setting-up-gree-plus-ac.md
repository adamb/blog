---
title: "Setting Up Gree+ AC with the Gree+ App"
date: "2026-02-11"
slug: "setting-up-gree-plus-ac"
---

# Setting Up Gree+ AC with the Gree+ App

Just got two of my Gree+ ACs back on the Wi‑Fi again – a quick reminder that getting these units into a smart home can feel like a mini‑treasure hunt. Below is a step‑by‑step guide that mirrors the exact sequence I use, so you can get your own Gree+ unit humming and controllable from the app without the usual guess‑work.

## Quick Overview

1. **Power off the AC** – make sure it’s not actively cooling.
2. **Enter Wi‑Fi pairing mode** – press the *mode‑wifi* button; you’ll hear a short beep.
3. **Wait 2 minutes** – the unit needs a moment to broadcast its Wi‑Fi SSID.
4. **Phone in airplane mode** – prevents it from connecting to LTE
5. **Join the *IOT* network** – This is the network you want the AC to be on.  I have an IOT network for all my devices.
6. **Open the Gree+ app** – the app will automatically detect the new device. If it doesn’t, you can add it manually.
   - **Automatic** – tap *Add Device* → the app should list the AC by its MAC address.
   - **Manual** – choose *Add Manually*, then join the Wi‑Fi SSID named something like `Gree_XXXXXX`; the SSID is usually the MAC address of the AC
7. **AC joins the app** – you’ll see a confirmation and the unit appears in your device list.
8. **Rename the unit** – give it a meaningful name (e.g., “Jade’s Bedroom AC”).
9. **Reserve a static lease on your router** – optional but handy; assign a fixed IP and give the host a friendly name.

## Detailed Walkthrough

### 1. Power Off

Make sure the AC is completely off. Either use the remote to turn it off or unplug it for a few seconds. This resets the internal Wi‑Fi module.

### 2. Activate Wi‑Fi Mode

On the remote, find the *mode‑wifi* button (usually the button with a Wi‑Fi icon). Press it once; you should hear a short beep indicating the unit is now broadcasting its own SSID.

### 3. Wait a Couple of Minutes

Give the unit about **2 minutes** to finish booting. It’s ready when you see the weird SSID Wi‑Fi network. During this time the AC’s internal Wi‑Fi chipset is preparing a temporary network.

### 4‑5. Connect Your Phone

- Enable **Airplane Mode** on your phone so it won’t automatically switch to LTE when you join the AC's SSID.
- Join your home network you want the AC to use.  In my case IOT is the SSID I use.

### 6. Pair in the Gree+ App

Open the **Gree+** app (available on iOS and Android). The app will usually discover the device automatically and show the MAC address and SSID. If it doesn’t:

1. Tap **Add Device** → **Manual**.
2. Join the **SSID** for the AC (the weird MAC address one)
3. Use the Wi‑Fi password from the app (e.g., 12345678). My phone remembered this from before.
4. Confirm and let the app push the Wi‑Fi credentials to the AC.

### 7. Verify the Connection

Once the pairing succeeds, the AC will disappear from the temporary “IOT” network and re‑join your home Wi‑Fi. You should see the unit listed in the app’s device pane.

### 8. Rename for Clarity

Tap the unit’s entry, choose **Rename**, and give it a name that makes sense in your house (e.g., “Living‑Room AC”). This name shows up in the app’s UI and any voice‑assistant integrations.

### 9. Static IP Lease

The Gree+ app seems to do better if there is a static IP.  If you like having a predictable IP address (useful for automations or Home Assistant), log into your router, locate the DHCP lease table, and reserve the AC’s MAC address to a fixed IP. Give the host a friendly name matching what you set in the app.

I name each of my units `foo‑ac`. I also link them to Alexa so I can turn the ACs on or off, or adjust them, via Alexa or Home Assistant.

## Model Details

I wrote this guide using **gpt‑oss:120b‑cloud** via the Ollama CLI (`ollama launch claude --model gpt-oss:120b-cloud`). If you’d like to run Claude with a different backend, see my previous post [Claude Code with Ollama Cloud](/2026/01/claude-ollama/).

### Enjoy


That’s it – you now have a fully integrated Gree+ AC that you can control from anywhere the app works. Enjoy the chill!

*Partially written by Claude Code.*
