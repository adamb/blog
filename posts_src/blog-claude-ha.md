---
title: "How I Use Claude Code to Manage My Home Assistant Setup"
date: "2026-04-02"
slug: "claude-code-home-assistant"
---

# How I Use Claude Code to Manage My Home Assistant Setup

I run a [Home Assistant](https://www.home-assistant.io/) instance that controls lighting, AC, security cameras, a mesh network, and more across my property in Puerto Rico. Over the past few months, I've developed a workflow where I use [Claude Code](https://claude.ai/code) — Anthropic's CLI tool — as my primary interface for building and debugging HA automations. Here's what a typical session looks like.

## The Setup

My HA configuration lives in a git repo alongside the OpenWrt firmware build system for my mesh network. Automations are individual YAML files in `monitoring/homeassistant/automations/`, version-controlled and deployed to HA via `scp`. Claude Code connects to my HA instance through an [MCP server](https://github.com/home-assistant/mcp-server), giving it the ability to search entities, read automation traces, reload configs, and query device states — all without leaving the terminal.

The workflow is: **edit locally → deploy via scp → reload automations → verify in HA**. Claude handles all of it.

## Debugging: "Why Did This Automation Just Run?"

I noticed my "Dresser Camera Off When Home" automation was firing repeatedly. This automation is supposed to turn off a USB-powered camera when I arrive home and turn it back on when I leave — a simple presence-based privacy toggle.

I asked Claude: *"why did the automation dresser camera off when home just run?"*

Claude pulled the automation's execution traces from HA and found the problem in seconds. The most recent run showed the trigger was a state change on `person.adam_beguelin` — but the transition was `home` → `home`. My phone's location tracker was sending periodic updates, and since the automation triggered on **any** state change (no `from`/`to` filter), every GPS refresh fired the automation.

The trace showed 5 runs in 40 minutes, all home-to-home transitions calling `switch.turn_off` on an already-off switch. Harmless but noisy.

Claude suggested adding explicit transition filters and I told it to make the change:

```yaml
# Before: fires on every person entity update
triggers:
  - trigger: state
    entity_id: person.adam_beguelin

# After: only fires on actual arrival/departure
triggers:
  - trigger: state
    entity_id: person.adam_beguelin
    from: "not_home"
    to: "home"
  - trigger: state
    entity_id: person.adam_beguelin
    from: "home"
    to: "not_home"
```

Claude edited the file, SCPed it to HA, reloaded automations, and committed to git — all in one flow. Total time from question to deployed fix: under two minutes.

## Quick Tweaks: Adjusting a Brightness Level

My bedroom has an automation that dims the light to 50% at 10pm. It was too dim. I said: *"the automation 'bedroom dim light' makes the lights too dim. increase the level."*

Claude found the file, bumped `brightness_pct` from 50 to 70, deployed it, reloaded, and committed. The whole interaction was four messages.

This is where the workflow really shines — for small adjustments, there's zero friction. No opening files, no remembering entity names, no manually SCPing. Just describe what's wrong and it's fixed.

## Building New Automations: Shed Motion Lights

The most involved task was building a new automation from scratch. I have a Blink camera on the shed with a motion sensor (`binary_sensor.shed_motion`) that wasn't wired to anything. I wanted it to turn on three outdoor lights at night — the porch light, column lights, and yard lights — for 10 minutes when motion is detected.

The tricky requirement: **handle lights that are already on**. If I manually turned on the yard lights before motion triggers, the automation shouldn't turn them off after 10 minutes.

I described what I wanted, and Claude entered planning mode. It:

1. **Explored existing patterns** — found my other motion automations (`casita_motion_lights.yaml`, `yard_lights_driveway_motion.yaml`, `balcony_motion_cube_light.yaml`) and analyzed how each handles the "already on" case
2. **Checked for conflicts** — discovered that `casita_motion_lights.yaml`'s alias mentions "Porche" but actually only controls `isla_light_1`, so no conflict
3. **Asked clarifying questions** — confirmed which porch light I meant, whether to skip or reset timers for already-on lights, and whether each light should be tracked independently
4. **Proposed a design** — snapshot each light's state into variables at trigger time, turn everything on, wait 10 minutes, then only turn off lights that were off before

The resulting automation uses a pattern I hadn't seen before in my own setup — variables to snapshot state:

```yaml
actions:
  - variables:
      porche_was_on: "{{ is_state('light.porche_light_1', 'on') }}"
      column_was_on: "{{ is_state('switch.column_lights_switch_load_control', 'on') }}"
      yard_was_on: "{{ is_state('switch.yard_lights', 'on') }}"
  - action: light.turn_on
    target:
      entity_id: light.porche_light_1
  # ... turn on switches ...
  - delay:
      minutes: 10
  - if:
      - condition: template
        value_template: "{{ not porche_was_on }}"
    then:
      - action: light.turn_off
        target:
          entity_id: light.porche_light_1
  # ... same for column and yard ...
```

With `mode: restart`, new motion resets the 10-minute timer. Each light is independent. Clean and predictable.

## Teaching Claude Your Patterns

One thing that made this session productive is that Claude Code supports **skills files** — project-specific instructions that teach it your conventions. I created two skills for this repo:

- **`ha`** — covers my automation file format, deployment workflow, trigger patterns (like the Inovelli button gotcha where consecutive same-type presses don't fire attribute-based triggers), entity naming conventions, and known quirks like the Tuya double-conversion bug
- **`openwrt`** — covers the mesh firmware build system, template engine, VLAN architecture, and critical rules (like never running `network restart` on mesh AP nodes)

These skills auto-load when Claude is working in the relevant area. It's like pair programming with someone who's read all your docs.

## The Workflow

Every automation change follows the same loop:

1. **Describe** what I want (or what's broken)
2. **Claude explores** — reads existing automations, searches for entities via MCP, checks traces
3. **Claude builds** — writes the YAML, matching existing patterns
4. **Deploy** — `scp` to HA, reload automations
5. **Verify** — confirm the entity exists and is enabled
6. **Commit** — git add, commit, push

Steps 2–6 happen without me touching a file or running a command. I stay in the conversation, reviewing what Claude proposes and course-correcting when needed.

For someone managing a non-trivial HA setup, this changes the economics of automation. The overhead of writing a new automation drops low enough that you actually build the ones you've been putting off.
