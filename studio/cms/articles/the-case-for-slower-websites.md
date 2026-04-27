---
type: article
title: "The case for slower websites"
synopsis: "We've spent a decade optimising for speed. But some of our most important interfaces should actually be slower."
date: 2026-04-04
author:
  name: "By Default"
  avatar: "https://bydefault.design/image/64x64?text=BD"
categories: ["Performance", "Interaction design"]
read-time: "5 min read"
featured: true
hero: "https://images.unsplash.com/photo-1656645123173-f98a07459f49?q=80&w=1288&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
thumbnail: "https://images.unsplash.com/photo-1656645123173-f98a07459f49?q=80&w=1288&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
thumbnail-ratio: "4:5"
---

We've spent a decade optimising for speed. Every framework, every build tool, every performance budget is oriented around making things faster. But what if some of our most important interfaces should actually be slower?

## Speed as a default

The web performance community has done extraordinary work. Core Web Vitals, lazy loading, edge caching, static generation — the tooling available to a developer in 2026 would have seemed miraculous a decade ago. A well-built marketing site can achieve a sub-second first contentful paint on a mid-range phone. That's genuinely impressive.

But speed has become a proxy for quality. We measure it, we optimise for it, we celebrate it. And in doing so, we've conflated "fast" with "good." They're not the same thing.

## When speed hurts

Consider a banking app. You tap "Transfer £5,000" and the confirmation appears 80 milliseconds later. Did it work? You're not sure. It was so fast you didn't register the transition. So you tap again. Now you've initiated two transfers.

Or consider an e-commerce checkout. The payment processes in 200ms and you're shown a confirmation page. But your brain hasn't caught up — you're still mentally preparing for a wait. The instant success feels untrustworthy. You check your email for a receipt. You check your bank app. You might even go back and do it again.

These are real patterns that real users exhibit. Speed creates anxiety when the action is consequential and the user expects a deliberate process.

## Intentional pacing

The solution isn't to make things artificially slow. It's to match the pace of the interface to the weight of the action. A search autocomplete should be instant. A payment confirmation should take a beat. A document deletion should feel deliberate.

This is what animation and transition design is really about. Not decoration — communication. A 600ms slide tells the user "something meaningful just happened." A 200ms fade says "this is routine." The duration is information.

The best interfaces use pacing the way a good editor uses sentence length. Short for urgency. Long for weight. Varied for rhythm. Never uniform.

## Designing for trust

Trust is built in the gap between action and confirmation. If that gap is zero, there's no room for trust to form. The user needs a moment — even a brief one — to register that their intent was received, processed, and fulfilled.

This doesn't mean adding fake loading spinners. It means designing transitions that communicate process. A progress bar that fills over 400ms. A button that changes state with a deliberate ease-out. A confirmation that builds up rather than appearing instantly.

The goal is not to slow users down. It's to let them feel the weight of what they've done. Speed is a tool. So is patience. The skill is knowing when to use which.

## The performance paradox

Here's the irony: achieving this kind of intentional pacing requires excellent performance. You need sub-100ms response times so you can choose where to spend the extra milliseconds. If your baseline is already slow, you can't afford to add deliberate pauses — everything just feels sluggish.

The fastest websites in the world are the ones that can afford to be slow when it matters.
