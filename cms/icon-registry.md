---
title: "Icon Registry"
subtitle: "Complete catalog of brand icons"
description: "The authoritative list of all available brand icons. Always use a brand icon before considering alternatives — if one doesn't exist, request it from the design team."
section: "Design System"
subsection: ""
order: 8
slug: "icon-registry"
status: "published"
access: "team"
client: "internal"
---

This is the single source of truth for every icon in the brand icon set. Before using any icon in a page, **check this registry first**. If the icon you need is not listed here, request it from the design team — do not substitute a generic icon from Material Design, Font Awesome, Heroicons, or any other external library.

All icons live in `assets/images/svg-icons/` and follow the standard `.icn-svg` wrapper pattern documented in [Iconography](iconography.html).

---

## The Rule

1. **Check this registry** — find the icon that matches your need
2. **Use the brand icon** — copy the SVG from `assets/images/svg-icons/`
3. **If no match exists** — request a new icon from the design team
4. **Never substitute** — do not use external icon libraries as a fallback

---

## Using Icons in Documentation

Use the `{{icon:name}}` shorthand to render an icon inline. This works in any markdown file processed by the doc generator.

```
{{icon:check}} renders the check icon
{{icon:arrow-right}} renders the arrow-right icon
```

---

## Navigation & Arrows

Icons for directional actions, navigation, and expandable content.

| | `data-icon` | File | Use for |
|---|---|---|---|
| {{icon:arrow-down}} | `arrow-down` | Arrow Down.svg | Downward navigation, scroll down |
| {{icon:arrow-left}} | `arrow-left` | Arrow Left.svg | Navigate back, previous |
| {{icon:arrow-right}} | `arrow-right` | Arrow Right.svg | Navigate forward, next, proceed |
| {{icon:arrow-top}} | `arrow-top` | Arrow Top.svg | Scroll to top, upward navigation |
| {{icon:arrow-top-right}} | `arrow-top-right` | Arrow Top Right.svg | External link, open in new context |
| {{icon:arrow-up}} | `arrow-up` | Arrow Up.svg | Move up, increase |
| {{icon:back-arrow}} | `back-arrow` | Back Arrow.svg | Go back, return to previous page |
| {{icon:chevron-down}} | `chevron-down` | Chevron Down.svg | Dropdown toggle, expand content |
| {{icon:chevron-down-large}} | `chevron-down-large` | Chevron Down Large.svg | Large dropdown, section expand |
| {{icon:chevron-left-large}} | `chevron-left-large` | Chevron Left Large.svg | Previous page, carousel back |
| {{icon:chevron-right-large}} | `chevron-right-large` | Chevron Right Large.svg | Next page, carousel forward |
| {{icon:chevron-up}} | `chevron-up` | Chevron Up.svg | Collapse content, close dropdown |
| {{icon:chevron-up-large}} | `chevron-up-large` | Chevron Up Large.svg | Large section collapse |

---

## Actions & UI Controls

Icons for interactive controls and common user actions.

| | `data-icon` | File | Use for |
|---|---|---|---|
| {{icon:add}} | `add` | Add.svg | Add item, create new |
| {{icon:check}} | `check` | Check.svg | Confirm, success, completed, checkbox |
| {{icon:close}} | `close` | Close.svg | Close, dismiss, remove |
| {{icon:close-large}} | `close-large` | Close Large.svg | Close modal, close overlay |
| {{icon:close-circled}} | `close-circled` | Close Circled.svg | Cancel, clear input |
| {{icon:copy}} | `copy` | Copy.svg | Copy to clipboard |
| {{icon:download}} | `download` | Download.svg | Download file |
| {{icon:drag}} | `drag` | Drag.svg | Drag handle, reorder |
| {{icon:filter}} | `filter` | Filter.svg | Filter content, refine results |
| {{icon:full-screen}} | `full-screen` | Full Screen.svg | Enter fullscreen mode |
| {{icon:menu}} | `menu` | Menu.svg | Hamburger menu, navigation toggle |
| {{icon:minus}} | `minus` | Minus.svg | Remove, decrease, collapse |
| {{icon:more-horizontal}} | `more-horizontal` | More Horizontal.svg | Overflow menu (horizontal dots) |
| {{icon:more-vertical}} | `more-vertical` | more-vertical.svg | Overflow menu (vertical dots) |
| {{icon:open-full}} | `open-full` | Open Full.svg | Expand, open in full view |
| {{icon:pin}} | `pin` | Pin.svg | Pin item, bookmark, save for later |
| {{icon:refresh}} | `refresh` | Refresh.svg | Reload, sync, update |
| {{icon:search}} | `search` | Search.svg | Search field, find content |
| {{icon:search-large}} | `search-large` | Search Large.svg | Prominent search action |
| {{icon:send}} | `send` | Send.svg | Submit, send message |
| {{icon:send-2}} | `send-2` | Send 2.svg | Alternative send style |
| {{icon:share}} | `share` | Share.svg | Share content |
| {{icon:share-1}} | `share-1` | Share-1.svg | Alternative share style |
| {{icon:switch}} | `switch` | switch.svg | Toggle between states |

---

## Sidebar & Layout

Icons for sidebar navigation and layout controls.

| | `data-icon` | File | Use for |
|---|---|---|---|
| {{icon:sidebar-open}} | `sidebar-open` | Sidebar Open.svg | Open sidebar panel |
| {{icon:sidebar-close}} | `sidebar-close` | Sidebar Close.svg | Close sidebar panel |
| {{icon:sidebar-close-2}} | `sidebar-close-2` | Sidebar Close 2.svg | Alternative sidebar close |
| {{icon:frame}} | `frame` | Frame.svg | Layout frame, artboard |
| {{icon:widgets}} | `widgets` | Widgets.svg | Dashboard widgets, modules |
| {{icon:list}} | `list` | List.svg | List view, ordered content |
| {{icon:stack}} | `stack` | Stack.svg | Stacked layers, grouped items |

---

## Content & Media

Icons for content types, documents, and media.

| | `data-icon` | File | Use for |
|---|---|---|---|
| {{icon:book}} | `book` | Book.svg | Documentation, reading, guides |
| {{icon:book-1}} | `book-1` | Book-1.svg | Alternative book style |
| {{icon:book-2}} | `book-2` | Book-2.svg | Alternative book style |
| {{icon:brand-book}} | `brand-book` | Brand Book.svg | Brand book, brand guidelines |
| {{icon:browser}} | `browser` | Browser.svg | Web page, website, URL |
| {{icon:calendar}} | `calendar` | Calendar.svg | Date, schedule, events |
| {{icon:clock}} | `clock` | Clock.svg | Time, duration, history |
| {{icon:docs}} | `docs` | Docs.svg | Documentation section |
| {{icon:folder}} | `folder` | Folder.svg | File directory, category |
| {{icon:link}} | `link` | Link.svg | Hyperlink, URL, connection |
| {{icon:news}} | `news` | News.svg | News article, announcement |
| {{icon:page}} | `page` | Page.svg | Document, single page |
| {{icon:photo}} | `photo` | photo.svg | Single image |
| {{icon:photos}} | `photos` | Photos.svg | Image gallery, multiple images |
| {{icon:play}} | `play` | Play.svg | Play media, start video |
| {{icon:play-2}} | `play-2` | Play 2.svg | Alternative play style |
| {{icon:video}} | `video` | Video.svg | Video content |

---

## Communication

Icons for messaging, email, and social interactions.

| | `data-icon` | File | Use for |
|---|---|---|---|
| {{icon:mail}} | `mail` | Mail.svg | Email, inbox |
| {{icon:mail-1}} | `mail-1` | Mail-1.svg | Alternative email style |
| {{icon:headphones}} | `headphones` | Headphones.svg | Audio, support, listen |
| {{icon:heart}} | `heart` | heart.svg | Like, favourite, love |
| {{icon:smiling}} | `smiling` | Smiling.svg | Feedback, satisfaction, emoji |

---

## User & Account

Icons for user-related features and authentication.

| | `data-icon` | File | Use for |
|---|---|---|---|
| {{icon:user}} | `user` | user.svg | User profile, account |
| {{icon:lock}} | `lock` | Lock.svg | Security, authentication, private |
| {{icon:credit-card}} | `credit-card` | Credit Card.svg | Payment, billing |
| {{icon:cog}} | `cog` | cog.svg | Settings, preferences |

---

## Theme & Accessibility

Icons for appearance settings and accessibility controls.

| | `data-icon` | File | Use for |
|---|---|---|---|
| {{icon:dark-mode}} | `dark-mode` | Dark Mode.svg | Dark theme toggle |
| {{icon:light-mode}} | `light-mode` | Light Mode.svg | Light theme toggle |
| {{icon:sun-1}} | `sun-1` | Sun 1.svg | Light/brightness |
| {{icon:sun-2}} | `sun-2` | Sun 2.svg | Alternative sun style |
| {{icon:font-size}} | `font-size` | Font Size.svg | Text size adjustment |
| {{icon:accesibility}} | `accesibility` | Accesibility.svg | Accessibility settings |
| {{icon:sound}} | `sound` | Sound.svg | Audio/volume |
| {{icon:sound-on}} | `sound-on` | Sound On.svg | Unmute, audio enabled |
| {{icon:sound-off}} | `sound-off` | Sound Off.svg | Mute, audio disabled |

---

## Cursor & Interaction

Icons representing cursor states and pointer types.

| | `data-icon` | File | Use for |
|---|---|---|---|
| {{icon:cursor}} | `cursor` | Cursor.svg | Default cursor, pointer |
| {{icon:cursor-pointer-1}} | `cursor-pointer-1` | Cursor Pointer 1.svg | Click interaction |
| {{icon:cursor-pointer-2}} | `cursor-pointer-2` | Cursor Pointer 2.svg | Alternative pointer |
| {{icon:cursor-pointer-3}} | `cursor-pointer-3` | Cursor Pointer 3.svg | Alternative pointer |
| {{icon:cursor-pointer-4}} | `cursor-pointer-4` | Cursor Pointer 4.svg | Alternative pointer |

---

## Technology & AI

Icons for tech features, AI, and digital tools.

| | `data-icon` | File | Use for |
|---|---|---|---|
| {{icon:3d}} | `3d` | 3D.svg | 3D content, spatial |
| {{icon:ai}} | `ai` | AI.svg | Artificial intelligence, smart features |
| {{icon:ai-chat}} | `ai-chat` | AI Chat.svg | AI conversation, chatbot |
| {{icon:ai-large}} | `ai-large` | AI Large.svg | Prominent AI feature |
| {{icon:ar}} | `ar` | AR.svg | Augmented reality |
| {{icon:bolt}} | `bolt` | Bolt.svg | Performance, speed, power |
| {{icon:design}} | `design` | Design.svg | Design tools, creative |
| {{icon:design-system}} | `design-system` | Design System.svg | Design system, component library |
| {{icon:paintbrush}} | `paintbrush` | Paintbrush.svg | Customisation, styling |
| {{icon:pencil-draw}} | `pencil-draw` | Pencil Draw.svg | Edit, draw, annotate |
| {{icon:tools}} | `tools` | Tools.svg | Tools section, utilities |

---

## Brand & Category

Icons representing brand-specific concepts and product categories.

| | `data-icon` | File | Use for |
|---|---|---|---|
| {{icon:game}} | `game` | Game.svg | Gaming content |
| {{icon:gamepad}} | `gamepad` | Gamepad.svg | Game controller, gaming |
| {{icon:globe}} | `globe` | Globe.svg | International, global, web |
| {{icon:home}} | `home` | Home.svg | Homepage, main screen |
| {{icon:map}} | `map` | Map.svg | Location, directions |
| {{icon:partner}} | `partner` | Partner.svg | Partnerships, collaboration |
| {{icon:present}} | `present` | Present.svg | Gift, reward, promotion |
| {{icon:shop}} | `shop` | Shop.svg | E-commerce, store, shopping |
| {{icon:t-shirt}} | `t-shirt` | T-Shirt.svg | Clothing, merchandise, apparel |
| {{icon:weapon}} | `weapon` | Weapon.svg | Gaming weapons, combat |

---

## Social Media

Icons for social platform links.

| | `data-icon` | File | Use for |
|---|---|---|---|
| {{icon:linkedin}} | `linkedin` | Linkedin.svg | LinkedIn profile/link |
| {{icon:reddit}} | `reddit` | Reddit.svg | Reddit profile/link |
| {{icon:spotify}} | `spotify` | Spotify.svg | Spotify profile/link |
| {{icon:youtube}} | `youtube` | YouTube.svg | YouTube channel/link |

---

## Status Indicators

Icons for progress and status states. Used by the documentation system.

| | `data-icon` | File | Use for |
|---|---|---|---|
| {{icon:status-0}} | `status-0` | Status-0.svg | Not started (0%) |
| {{icon:status-10}} | `status-10` | Status-10.svg | Just begun (10%) |
| {{icon:status-20}} | `status-20` | Status-20.svg | Early progress (20%) |
| {{icon:status-50}} | `status-50` | Status-50.svg | Halfway (50%) |
| {{icon:status-75}} | `status-75` | Status-75.svg | Mostly done (75%) |
| {{icon:status-100}} | `status-100` | Status-100.svg | Complete (100%) |
| {{icon:status-check}} | `status-check` | Status-check.svg | Verified, approved |

---

## Miscellaneous

Icons that don't fit neatly into other categories.

| | `data-icon` | File | Use for |
|---|---|---|---|
| {{icon:icon}} | `icon` | Icon.svg | Generic icon placeholder |
| {{icon:icon-1}} | `icon-1` | Icon-1.svg | Alternative generic placeholder |
| {{icon:info}} | `info` | Info.svg | Information, help tooltip |
| {{icon:question}} | `question` | Question.svg | Help, FAQ, unknown |

---

## Requesting a New Icon

If you need an icon that is not listed above:

1. **Check the registry again** — the icon you need may exist under a different name or category
2. **Document the request** — describe the concept, intended size, and where it will be used
3. **Submit to the design team** — new icons must match the existing style (24x24 grid, single-colour, rounded corners)
4. **Do not use a placeholder** — wait for the brand icon to be designed rather than shipping with a generic substitute

Maintaining a consistent icon language across the site is more important than shipping fast with mismatched icons.
