---
title: "Dropdown"
subtitle: "Contextual menus and action lists"
description: "How to use the dropdown component for contextual menus, action lists, settings panels, and navigation."
author: "Studio"
section: "Design System"
layer: "core"
subsection: "Content"
order: 5
status: "published"
access: "team"
client: "internal"
---

Dropdowns show a contextual menu when a trigger is clicked. They are the universal menu pattern — used in the site header, sticky bars, tool toolbars, and page content. One component, same classes everywhere.

---

## Tokens

| Token | Default | Purpose |
|-------|---------|---------|
| `var(--dropdown-background)` | `var(--background-primary)` | Menu background |
| `var(--dropdown-border)` | `var(--border-faded)` | Menu and divider border |
| `var(--dropdown-item-hover)` | `var(--background-faded)` | Item hover background |

---

## Trigger patterns

The trigger is the element that opens the dropdown. `.dropdown-trigger` provides built-in styling — no additional classes needed.

### Icon + text + chevron

The most common trigger. The `.dropdown-chevron` rotates 180 degrees when the dropdown is open.

<div class="demo-preview">
  <div class="dropdown">
    <button class="dropdown-trigger" type="button" aria-haspopup="true" aria-expanded="false">
      <div class="svg-icn" data-icon="user"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 12C10.9 12 9.95833 11.6083 9.175 10.825C8.39167 10.0417 8 9.1 8 8C8 6.9 8.39167 5.95833 9.175 5.175C9.95833 4.39167 10.9 4 12 4C13.1 4 14.0417 4.39167 14.825 5.175C15.6083 5.95833 16 6.9 16 8C16 9.1 15.6083 10.0417 14.825 10.825C14.0417 11.6083 13.1 12 12 12ZM4 20V17.2C4 16.6333 4.14583 16.1125 4.4375 15.6375C4.72917 15.1625 5.11667 14.8 5.6 14.55C6.63333 14.0333 7.68333 13.6458 8.75 13.3875C9.81667 13.1292 10.9 13 12 13C13.1 13 14.1833 13.1292 15.25 13.3875C16.3167 13.6458 17.3667 14.0333 18.4 14.55C18.8833 14.8 19.2708 15.1625 19.5625 15.6375C19.8542 16.1125 20 16.6333 20 17.2V20H4Z" fill="currentColor"/></svg></div>
      <span>Account</span>
      <div class="svg-icn dropdown-chevron" data-icon="chevron-down"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15.375L6 9.375L7.4 7.975L12 12.575L16.6 7.975L18 9.375L12 15.375Z" fill="currentColor"/></svg></div>
    </button>
    <div class="dropdown-menu">
      <button class="dropdown-item" role="menuitem" type="button">Profile</button>
      <button class="dropdown-item" role="menuitem" type="button">Settings</button>
      <div class="dropdown-divider" role="separator"></div>
      <button class="dropdown-item dropdown-item--danger" role="menuitem" type="button">Sign out</button>
    </div>
  </div>
</div>

```html
<div class="dropdown">
  <button class="dropdown-trigger" type="button" aria-haspopup="true" aria-expanded="false">
    <div class="svg-icn" data-icon="user"><!-- svg --></div>
    <span>Account</span>
    <div class="svg-icn dropdown-chevron" data-icon="chevron-down"><!-- svg --></div>
  </button>
  <div class="dropdown-menu">
    <!-- items -->
  </div>
</div>
```

### Icon-only trigger

For toolbars and compact contexts. No text, no chevron — the icon alone signals "click for options."

<div class="demo-preview">
  <div class="dropdown">
    <button class="dropdown-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-label="More options">
      <div class="svg-icn" data-icon="more-horizontal"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 10L6 10V14H2L2 10ZM10 10L14 10V14H10V10ZM18 10L22 10V14H18V10Z" fill="currentColor"/></svg></div>
    </button>
    <div class="dropdown-menu is-right">
      <button class="dropdown-item" role="menuitem" type="button">Edit</button>
      <button class="dropdown-item" role="menuitem" type="button">Duplicate</button>
      <div class="dropdown-divider" role="separator"></div>
      <button class="dropdown-item dropdown-item--danger" role="menuitem" type="button">Delete</button>
    </div>
  </div>
</div>

```html
<button class="dropdown-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-label="More options">
  <div class="svg-icn" data-icon="more-horizontal"><!-- svg --></div>
</button>
```

### Button trigger

For page content where the trigger should look like a standard button.

<div class="demo-preview">
  <div class="dropdown">
    <button class="dropdown-trigger button" data-variant="outline" type="button" aria-haspopup="true" aria-expanded="false">
      Options
      <div class="svg-icn dropdown-chevron" data-icon="chevron-down"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15.375L6 9.375L7.4 7.975L12 12.575L16.6 7.975L18 9.375L12 15.375Z" fill="currentColor"/></svg></div>
    </button>
    <div class="dropdown-menu">
      <button class="dropdown-item" role="menuitem" type="button">Option A</button>
      <button class="dropdown-item" role="menuitem" type="button">Option B</button>
      <button class="dropdown-item" role="menuitem" type="button">Option C</button>
    </div>
  </div>
</div>

```html
<button class="dropdown-trigger button" data-variant="outline" type="button" ...>
  Options
  <div class="svg-icn dropdown-chevron"><!-- chevron svg --></div>
</button>
```

---

## When to use a chevron

| Scenario | Chevron? | Why |
|----------|----------|-----|
| Selector-style trigger (choosing a value) | Yes | Signals "pick from a list" |
| Navigation dropdown (Account, Profile) | Yes | Shows the menu expands downward |
| Icon-only trigger (⋯ more, settings gear) | No | The icon itself implies a menu |
| Button trigger with label | Optional | Use when the button looks like a selector |

---

## Menu alignment

Menus open left-aligned by default. Add `.is-right` to right-align from the trigger.

```html
<div class="dropdown-menu is-right">
```

Use `.is-right` when the dropdown is near the right edge of the viewport to prevent overflow.

---

## Item patterns

### Text-only item

The simplest item — just a label with no icon.

<div class="demo-preview">
  <div class="dropdown">
    <button class="dropdown-trigger" type="button" aria-haspopup="true" aria-expanded="false">
      <span>Roles</span>
      <div class="svg-icn dropdown-chevron" data-icon="chevron-down"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15.375L6 9.375L7.4 7.975L12 12.575L16.6 7.975L18 9.375L12 15.375Z" fill="currentColor"/></svg></div>
    </button>
    <div class="dropdown-menu">
      <button class="dropdown-item" role="menuitem" type="button">Admin</button>
      <button class="dropdown-item" role="menuitem" type="button">Team</button>
      <button class="dropdown-item" role="menuitem" type="button">Public</button>
    </div>
  </div>
</div>

```html
<button class="dropdown-item" role="menuitem" type="button">Admin</button>
```

### Icon-left item

An icon before the text reinforces the action. Use for action verbs like Edit, Download, Delete.

<div class="demo-preview">
  <div class="dropdown">
    <button class="dropdown-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Actions">
      <div class="svg-icn" data-icon="more-horizontal"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 10L6 10V14H2L2 10ZM10 10L14 10V14H10V10ZM18 10L22 10V14H18V10Z" fill="currentColor"/></svg></div>
    </button>
    <div class="dropdown-menu">
      <button class="dropdown-item" role="menuitem" type="button">
        <div class="svg-icn" data-icon="settings"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M11 15H22V17H11V19H5V17H2V15H5V13H11V15ZM7 17H9V15H7V17Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M19 7H22V9H19V11H13V9H2V7H13V5H19V7ZM15 9H17V7H15V9Z" fill="currentColor"/></svg></div>
        <span>Settings</span>
      </button>
      <button class="dropdown-item" role="menuitem" type="button">
        <div class="svg-icn" data-icon="download"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 17L5 10L6.4 8.6L9.29482 11.4791C9.92557 12.1064 11 11.6597 11 10.7701V3H13V10.7608C13 11.6517 14.0771 12.0979 14.7071 11.4679L17.6 8.575L19 10L12 17Z" fill="currentColor"/><path d="M4 21V15H6V17C6 18.1046 6.89543 19 8 19H16C17.1046 19 18 18.1046 18 17V15H20V21H4Z" fill="currentColor"/></svg></div>
        <span>Download</span>
      </button>
      <div class="dropdown-divider" role="separator"></div>
      <button class="dropdown-item dropdown-item--danger" role="menuitem" type="button">
        <div class="svg-icn" data-icon="close"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.4 19L5 17.6L9.18579 13.4142C9.96684 12.6332 9.96684 11.3668 9.18579 10.5858L5 6.4L6.4 5L10.5858 9.18579C11.3668 9.96684 12.6332 9.96684 13.4142 9.18579L17.6 5L19 6.4L14.8142 10.5858C14.0332 11.3668 14.0332 12.6332 14.8142 13.4142L19 17.6L17.6 19L13.4142 14.8142C12.6332 14.0332 11.3668 14.0332 10.5858 14.8142L6.4 19Z" fill="currentColor"/></svg></div>
        <span>Delete</span>
      </button>
    </div>
  </div>
</div>

```html
<button class="dropdown-item" role="menuitem" type="button">
  <div class="svg-icn" data-icon="settings"><!-- svg --></div>
  <span>Settings</span>
</button>
```

### Icon-right item (trailing content)

Use `.dropdown-item-end` to push trailing content to the right edge. Ideal for keyboard shortcuts, badges, status indicators, or chevrons hinting at sub-menus.

<div class="demo-preview">
  <div class="dropdown">
    <button class="dropdown-trigger button" data-variant="outline" type="button" aria-haspopup="true" aria-expanded="false">
      Edit
      <div class="svg-icn dropdown-chevron" data-icon="chevron-down"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15.375L6 9.375L7.4 7.975L12 12.575L16.6 7.975L18 9.375L12 15.375Z" fill="currentColor"/></svg></div>
    </button>
    <div class="dropdown-menu">
      <button class="dropdown-item" role="menuitem" type="button">
        <span>Undo</span>
        <span class="dropdown-item-end"><kbd>Ctrl+Z</kbd></span>
      </button>
      <button class="dropdown-item" role="menuitem" type="button">
        <span>Redo</span>
        <span class="dropdown-item-end"><kbd>Ctrl+Y</kbd></span>
      </button>
      <div class="dropdown-divider" role="separator"></div>
      <button class="dropdown-item" role="menuitem" type="button">
        <span>Cut</span>
        <span class="dropdown-item-end"><kbd>Ctrl+X</kbd></span>
      </button>
      <button class="dropdown-item" role="menuitem" type="button">
        <span>Copy</span>
        <span class="dropdown-item-end"><kbd>Ctrl+C</kbd></span>
      </button>
      <button class="dropdown-item" role="menuitem" type="button">
        <span>Paste</span>
        <span class="dropdown-item-end"><kbd>Ctrl+V</kbd></span>
      </button>
    </div>
  </div>
</div>

```html
<button class="dropdown-item" role="menuitem" type="button">
  <span>Undo</span>
  <span class="dropdown-item-end"><kbd>Ctrl+Z</kbd></span>
</button>
```

### Item with description

Use `.dropdown-desc` for supporting text below the label.

<div class="demo-preview">
  <div class="dropdown">
    <button class="dropdown-trigger button" data-variant="outline" type="button" aria-haspopup="true" aria-expanded="false">
      New
      <div class="svg-icn dropdown-chevron" data-icon="chevron-down"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15.375L6 9.375L7.4 7.975L12 12.575L16.6 7.975L18 9.375L12 15.375Z" fill="currentColor"/></svg></div>
    </button>
    <div class="dropdown-menu">
      <button class="dropdown-item" role="menuitem" type="button">
        <div>
          <div>Blank project</div>
          <div class="dropdown-desc">Start from scratch with an empty project</div>
        </div>
      </button>
      <button class="dropdown-item" role="menuitem" type="button">
        <div>
          <div>From template</div>
          <div class="dropdown-desc">Choose from pre-built project templates</div>
        </div>
      </button>
      <button class="dropdown-item" role="menuitem" type="button">
        <div>
          <div>Import</div>
          <div class="dropdown-desc">Import an existing project from a file or URL</div>
        </div>
      </button>
    </div>
  </div>
</div>

```html
<button class="dropdown-item" role="menuitem" type="button">
  <div>
    <div>From template</div>
    <div class="dropdown-desc">Choose from pre-built project templates</div>
  </div>
</button>
```

### Avatar item

For user menus showing the logged-in user's identity.

<div class="demo-preview">
  <div class="dropdown">
    <button class="dropdown-trigger" type="button" aria-haspopup="true" aria-expanded="false">
      <span class="auth-user-avatar" style="width: 1.5rem; height: 1.5rem; border-radius: 50%; background: var(--background-darker); display: flex; align-items: center; justify-content: center; font-size: var(--font-2xs); font-weight: var(--font-weight-semi-bold); flex-shrink: 0;">E</span>
      <span>Erlen</span>
      <div class="svg-icn dropdown-chevron" data-icon="chevron-down"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15.375L6 9.375L7.4 7.975L12 12.575L16.6 7.975L18 9.375L12 15.375Z" fill="currentColor"/></svg></div>
    </button>
    <div class="dropdown-menu is-right">
      <div class="dropdown-item" style="pointer-events: none;">
        <span class="auth-user-avatar" style="width: 2rem; height: 2rem; border-radius: 50%; background: var(--background-darker); display: flex; align-items: center; justify-content: center; font-size: var(--font-xs); font-weight: var(--font-weight-semi-bold); flex-shrink: 0;">E</span>
        <div>
          <div>Erlen Masson</div>
          <div class="dropdown-desc">erlen@bydefault.studio</div>
        </div>
      </div>
      <div class="dropdown-divider" role="separator"></div>
      <button class="dropdown-item" role="menuitem" type="button">
        <div class="svg-icn" data-icon="settings"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M11 15H22V17H11V19H5V17H2V15H5V13H11V15ZM7 17H9V15H7V17Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M19 7H22V9H19V11H13V9H2V7H13V5H19V7ZM15 9H17V7H15V9Z" fill="currentColor"/></svg></div>
        <span>Account</span>
      </button>
      <button class="dropdown-item dropdown-item--danger" role="menuitem" type="button">
        <div class="svg-icn" data-icon="logout"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 21C4.45 21 3.97917 20.8042 3.5875 20.4125C3.19583 20.0208 3 19.55 3 19V5C3 4.45 3.19583 3.97917 3.5875 3.5875C3.97917 3.19583 4.45 3 5 3H12V5H5V19H12V21H5ZM16 17L14.625 15.55L17.175 13H9V11H17.175L14.625 8.45L16 7L21 12L16 17Z" fill="currentColor"/></svg></div>
        <span>Log out</span>
      </button>
    </div>
  </div>
</div>

---

## Section labels

Use `.dropdown-label` to create non-interactive section headers that group items.

<div class="demo-preview">
  <div class="dropdown">
    <button class="dropdown-trigger" type="button" aria-haspopup="true" aria-expanded="false">
      <span>Project</span>
      <div class="svg-icn dropdown-chevron" data-icon="chevron-down"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15.375L6 9.375L7.4 7.975L12 12.575L16.6 7.975L18 9.375L12 15.375Z" fill="currentColor"/></svg></div>
    </button>
    <div class="dropdown-menu">
      <div class="dropdown-label">Actions</div>
      <button class="dropdown-item" role="menuitem" type="button">Rename</button>
      <button class="dropdown-item" role="menuitem" type="button">Duplicate</button>
      <button class="dropdown-item" role="menuitem" type="button">Archive</button>
      <div class="dropdown-divider" role="separator"></div>
      <div class="dropdown-label">Danger zone</div>
      <button class="dropdown-item dropdown-item--danger" role="menuitem" type="button">Delete project</button>
    </div>
  </div>
</div>

```html
<div class="dropdown-label">Actions</div>
<button class="dropdown-item" role="menuitem" type="button">Rename</button>
...
<div class="dropdown-divider" role="separator"></div>
<div class="dropdown-label">Danger zone</div>
<button class="dropdown-item dropdown-item--danger" role="menuitem" type="button">Delete project</button>
```

---

## Disabled item

<div class="demo-preview">
  <div class="dropdown">
    <button class="dropdown-trigger button" data-variant="outline" type="button" aria-haspopup="true" aria-expanded="false">File</button>
    <div class="dropdown-menu">
      <button class="dropdown-item" role="menuitem" type="button">Save</button>
      <button class="dropdown-item is-disabled" role="menuitem" type="button" disabled aria-disabled="true">Save as...</button>
      <button class="dropdown-item" role="menuitem" type="button">Export</button>
    </div>
  </div>
</div>

```html
<button class="dropdown-item is-disabled" role="menuitem" type="button" disabled aria-disabled="true">
  Save as...
</button>
```

---

## When to use what

| Pattern | When to use | Example |
|---------|-------------|---------|
| Icon-left | Action verbs — the icon reinforces what the action does | Edit, Download, Delete, Settings |
| Icon-right (`.dropdown-item-end`) | Trailing metadata — keyboard shortcuts, badges, status | Undo `Ctrl+Z`, Status `Active` |
| No icon | Simple value selection — the text is self-explanatory | Role names, client names, sizes |
| Avatar | User identification — profile menus | Account dropdown |
| Description (`.dropdown-desc`) | Items that need explanation | "From template — Choose from pre-built..." |
| Section label (`.dropdown-label`) | Grouping related items under a heading | "Switch Role", "Danger zone" |
| Divider (`.dropdown-divider`) | Separating logical groups | Between actions and danger items |

---

## JavaScript

Include `assets/js/dropdown.js` on any page. It auto-initialises all `.dropdown` elements — no setup needed.

```html
<script src="/assets/js/dropdown.js"></script>
```

Clicking a `.dropdown-trigger` toggles `.is-open` on the parent `.dropdown`. Clicking outside or pressing Escape closes all open dropdowns.

---

## Keyboard interactions

| Key | Action |
|-----|--------|
| `Enter` / `Space` | Opens the dropdown (on trigger), activates item (on item) |
| `ArrowDown` | Moves focus to the next item |
| `ArrowUp` | Moves focus to the previous item |
| `Escape` | Closes the dropdown and returns focus to the trigger |
| `Tab` | Moves focus out of the dropdown |

---

## Accessibility notes

- Trigger: `aria-haspopup="true"`, `aria-expanded="false"` (JS updates to `"true"` on open)
- Icon-only triggers: add `aria-label` describing the action
- Menu: `role="menu"`
- Items: `role="menuitem"` on buttons, or just `<a>` for link items
- Dividers: `role="separator"`
- Disabled items: `disabled` attribute + `aria-disabled="true"`

---

## Structure reference

| Element | Class | Purpose |
|---------|-------|---------|
| Container | `.dropdown` | Positioning context |
| Trigger | `.dropdown-trigger` | Clickable element that opens the menu |
| Chevron | `.dropdown-chevron` | Rotating arrow indicator (on trigger) |
| Menu | `.dropdown-menu` | The panel that appears |
| Menu (right) | `.dropdown-menu .is-right` | Right-aligned from trigger |
| Item | `.dropdown-item` | Clickable row |
| Item (danger) | `.dropdown-item .dropdown-item--danger` | Destructive action |
| Item (disabled) | `.dropdown-item .is-disabled` | Unavailable action |
| Trailing content | `.dropdown-item-end` | Right-aligned metadata inside an item |
| Description | `.dropdown-desc` | Supporting text under item label |
| Label | `.dropdown-label` | Non-interactive section header |
| Divider | `.dropdown-divider` | Separator line between groups |

---

## Do / Don't

**Do:**
- Use dropdowns for contextual actions and selections
- Group related items with labels and dividers
- Use icon-left for actions, icon-right for metadata
- Add `aria-label` on icon-only triggers
- Use `.is-right` near the right viewport edge

**Don't:**
- Don't use dropdowns for primary navigation — use tabs or links
- Don't nest dropdowns inside dropdowns
- Don't use dropdowns for form field selection — use `<select>` instead
- Don't put more than 10 items in a single dropdown — break into sections or use a different pattern
