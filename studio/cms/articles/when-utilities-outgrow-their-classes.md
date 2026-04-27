---
type: article
title: "When utilities outgrow their classes"
synopsis: "Utility classes start as a way to move fast. Eventually they become the codebase. Here's the inflection point most teams miss."
date: 2026-04-12
author:
  name: "By Default"
  avatar: "https://bydefault.design/image/64x64?text=BD"
categories: ["CSS", "Architecture"]
read-time: "5 min read"
featured: true
hero: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2940&auto=format&fit=crop"
thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2940&auto=format&fit=crop"
thumbnail-ratio: "4:5"
---

> Placeholder copy. This is a stub article used to test the homepage feed layout. Replace this body before publishing.

Utilities are great until they aren't. The first hundred classes feel like leverage — apply them anywhere and the page falls into shape without writing a line of bespoke CSS. The next thousand are a different story.

There is a moment, usually six to nine months into a project, when the utility soup gets so dense that nobody can refactor anything without breaking three other things. The classes have stopped describing intent and started describing geometry, pixel by pixel, repeated across every component.

The trick is recognising the inflection point before you cross it. This placeholder body would normally walk through three signals — repeated class clusters, semantic drift, and the rise of "wrapper components" that exist only to hold long class strings — and what to do about each.
