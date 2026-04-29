---
type: article
title: "Naming things: the hardest problem in design systems"
synopsis: "A design token called --blue-500 is a value. One called --text-primary is a decision. The difference is everything."
date: 2026-04-28
author:
  name: "By Default"
  avatar: "https://bydefault.design/image/64x64?text=BD"
categories: ["Systems", "Naming"]
read-time: "7 min read"
featured: false
hero: "https://images.unsplash.com/photo-1773332585754-f1436987743b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
thumbnail: "https://images.unsplash.com/photo-1773332585754-f1436987743b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
thumbnail-ratio: "1:1"
---

There are only two hard things in computer science: cache invalidation and naming things. Design systems inherit the naming problem and make it worse, because the names need to make sense to designers, developers, and stakeholders — three groups with different mental models.

## Why naming matters more than you think

A design token called `--blue-500` is a value. A token called `--text-primary` is a decision. The difference isn't cosmetic — it determines whether your system can survive a rebrand, a dark mode, or a white-label deployment.

When you name a colour by its hue, you've baked a visual decision into the API. Every consumer of that token is now coupled to the specific shade of blue you chose today. Change the brand colour to green and every reference to `--blue-500` becomes a lie. You either live with misleading names or do a find-and-replace across the entire codebase.

Semantic names avoid this entirely. `--text-primary` is always the primary text colour, regardless of whether that's black, white, dark grey, or deep purple. The name describes the intent, not the implementation.

## The t-shirt scale

Spacing, type size, border radius, and duration all share a common problem: you need a fixed number of values on a scale, and you need names that communicate relative size without implying exact values.

The t-shirt scale (xs, s, m, l, xl) works because everyone already knows it. There's no learning curve. `--space-m` is medium spacing. `--font-l` is large text. `--radius-s` is a small corner. You don't need to memorise what "4" means on a numeric scale or what "compact" means in a named scale.

The scale is also naturally extensible. Need something between xs and s? That's 2xs. Need something larger than xl? That's 2xl. The pattern is self-documenting.

## Component naming

Components have a different naming challenge. They need names that are specific enough to find and generic enough to reuse. `.primary-hero-banner-with-video` is too specific — it'll only be used once. `.box` is too generic — it could mean anything.

The best component names describe what the thing is, not what it does or where it goes. `.card` is a card. `.badge` is a badge. `.callout` is a callout. You can put a card in a sidebar, a feed, or a modal — the name still works because it describes the object, not its context.

Modifiers handle the variants: `.card--compact`, `data-color="warning"`, `data-type="success"`. The base name is the noun; the modifier is the adjective. This is BEM without the ceremony.

## The documentation test

Here's a simple test for any name: can you use it in a sentence without it sounding absurd? "Set the text colour to `--text-primary`" works. "Set the text colour to `--neutral-800`" works but doesn't tell you why. "Set the text colour to `--dark-text-color-main-default`" is a sign that your naming convention has become its own problem.

Names should be short enough to type without autocomplete and long enough to understand without context. That's a narrow band, and finding it takes iteration. The first name you choose is almost never the right one.

## When to rename

Renaming is expensive. Every consumer of the old name needs to update. But living with a bad name is also expensive — it creates confusion every time someone new joins the team, and it erodes trust in the system's coherence.

The rule of thumb: rename early, before adoption spreads. If a name is wrong and only two projects use it, rename it now. If 200 projects use it, you're stuck with it unless you can provide a migration path (aliases, deprecation warnings, automated codemods).

The best time to get a name right is before you ship it. The second best time is before anyone else starts using it. After that, you're negotiating with an installed base.
