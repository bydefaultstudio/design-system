---
type: article
title: "Component docs that don't lie"
synopsis: "Most component documentation rots faster than the code it describes. Here's how to write docs that stay true."
date: 2026-04-22
author:
  name: "By Default"
  avatar: "https://bydefault.design/image/64x64?text=BD"
categories: ["Documentation", "Components"]
read-time: "4 min read"
featured: false
hero: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=2940&auto=format&fit=crop"
thumbnail: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=2940&auto=format&fit=crop"
thumbnail-ratio: "4:5"
---

> Placeholder copy. This is a stub article used to test the homepage feed layout. Replace this body before publishing.

A component's documentation is a contract. It tells future engineers, designers, and AI agents what the component is for, how it composes with the rest of the system, and what it refuses to do. When the docs disagree with the code, the contract breaks — and the system silently loses trust.

The fix isn't more documentation. It's documentation that lives next to the code it describes, gets generated from a single source, and fails the build when it falls out of sync.

This is placeholder text intended to occupy space while the feed is being designed. The actual article will cover three patterns for keeping component docs honest: doc generation from prop types, golden snapshot tests for usage examples, and a simple "last reviewed" header on every page that decays into a warning after 90 days.
