---
title: "Hero Shapes Analytics Tracking"
subtitle: "Analytics tracking system for Hero Shapes physics interactions"
description: "Complete guide to the analytics events tracked in the Hero Shapes physics section, including event triggers, data properties, and implementation details."
section: "Website"
layer: "app"
subsection: "Pages"
order: 3
---

# Hero Shapes Analytics Tracking

Complete analytics tracking system for user interactions within the Hero Shapes physics section. All events are pushed to `window.dataLayer` (for Google Tag Manager) or fall back to `gtag()` if GTM is not present.

## Overview

The tracking system monitors user interactions with the physics shapes, including drags, clicks, and time spent interacting. All tracking is session-based and designed to be lightweight and non-intrusive to the physics engine performance.

## Implementation

The analytics system is integrated into `hero-shapes.js` and uses a modular approach:

- **State Management**: Lightweight in-memory state tracking
- **Event Helper**: Single `trackEvent()` function that handles both GTM and gtag
- **Event Hooks**: Integrated into existing Matter.js event listeners
- **No Performance Impact**: Tracking runs asynchronously and doesn't block physics calculations

## Tracked Events

### 1. `interaction_started`

**Trigger:** Fires the moment the user performs their first drag in the session.

**Fires Once:** Yes, only once per session.

**Event Data:**
```javascript
{
  event: "interaction_started",
  timestamp: 1234567890123,
  shape_label: "news" // or null if drag didn't start on a shape
}
```

**When It Fires:**
- First time a user starts dragging any shape
- Before any other interaction events
- Starts the interaction timer

---

### 2. `first_shape_dragged`

**Trigger:** Fires only the first time a user drags a shape.

**Fires Once:** Yes, only once per session.

**Event Data:**
```javascript
{
  event: "first_shape_dragged",
  shape_label: "news",
  shape_index: 0,
  timestamp: 1234567890123
}
```

**When It Fires:**
- First drag of any shape in the session
- Only if the drag started on an actual shape (not logo or walls)

---

### 3. `shape_dragged`

**Trigger:** Fires every time a drag begins.

**Fires Once:** No, fires on every drag.

**Event Data:**
```javascript
{
  event: "shape_dragged",
  shape_label: "founders",
  total_drags: 5,
  timestamp: 1234567890123
}
```

**Properties:**
- `total_drags`: Increments with each drag (session counter)
- `shape_label`: Label of the shape being dragged

**When It Fires:**
- Every time a user starts dragging a shape
- Increments the session drag counter
- Adds shape to unique shapes set

---

### 4. `shape_clicked`

**Trigger:** When a shape is clicked (not dragged).

**Fires Once:** No, fires on every click.

**Event Data:**
```javascript
{
  event: "shape_clicked",
  shape_label: "work",
  timestamp: 1234567890123
}
```

**Click Detection:**
- Uses existing 5px distance threshold
- If mouse movement < 5px between mousedown and mouseup = click
- If mouse movement >= 5px = drag (not tracked as click)

**When It Fires:**
- User clicks a shape without dragging
- Only fires for actual shapes (not logo or walls)

---

### 5. `time_spent_interacting`

**Trigger:** Fires when user becomes inactive or page unloads.

**Fires Once:** Per interaction session.

**Event Data:**
```javascript
{
  event: "time_spent_interacting",
  interaction_duration_ms: 15420,
  total_drags: 8,
  shapes_interacted_count: 3,
  timestamp: 1234567890123
}
```

**Properties:**
- `interaction_duration_ms`: Time from `interaction_started` to inactivity/unload
- `total_drags`: Total number of drags in the session
- `shapes_interacted_count`: Number of unique shapes interacted with

**When It Fires:**
- After 3 seconds of inactivity (no drags)
- On page unload (`beforeunload` event)
- Timer starts when `interaction_started` fires

**Inactivity Detection:**
- 3-second timeout after last drag ends
- Timer resets on each new drag
- Only fires if an interaction was started

---

### 6. `shapes_interacted_count`

**Logic:** Maintains a Set of unique shape labels the user has interacted with.

**Included In:** `time_spent_interacting` event (as `shapes_interacted_count` property).

**How It Works:**
- Each shape label is added to a Set when dragged
- Set automatically handles uniqueness
- Count is included in `time_spent_interacting` event

---

### 7. `reset_button_clicked`

**Trigger:** Fires when the reset button is clicked.

**Fires Once:** No, fires every time reset is clicked.

**Event Data:**
```javascript
{
  event: "reset_button_clicked",
  timestamp: 1234567890123,
  total_drags: 12,
  interaction_duration_ms: 28450
}
```

**Properties:**
- `total_drags`: Total drags so far in the session
- `interaction_duration_ms`: Time since `interaction_started` (if started)

**When It Fires:**
- User clicks the reset button (`#button-on-canvas`)
- Fires before shapes are reset
- Includes current session stats

---

## Technical Implementation

### Event Helper Function

```javascript
function trackEvent(eventName, eventData = {}) {
  // Adds timestamp if not provided
  if (!eventData.timestamp) {
    eventData.timestamp = Date.now();
  }

  // Push to dataLayer for GTM
  if (window.dataLayer && Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: eventName,
      ...eventData
    });
  } 
  // Fallback to gtag if available
  else if (typeof gtag === 'function') {
    gtag('event', eventName, eventData);
  }
}
```

### State Management

All tracking state is stored in `window.stackingShapes.analytics`:

```javascript
{
  hasStarted: false,              // Has interaction_started fired?
  hasDraggedFirstShape: false,    // Has first_shape_dragged fired?
  interactionStartTime: null,     // When did interaction start?
  totalDrags: 0,                  // Session drag counter
  shapesSet: new Set(),           // Unique shapes interacted with
  inactivityTimer: null,          // Inactivity timeout reference
  INACTIVITY_TIMEOUT: 3000        // 3 seconds
}
```

### Event Hooks

Tracking is integrated into existing Matter.js event listeners:

- **`startdrag` event** - `interaction_started`, `first_shape_dragged`, `shape_dragged`
- **`enddrag` event** - Inactivity timer check
- **`mouseup` event** - `shape_clicked` (if distance < 5px)
- **`beforeunload` event** - `time_spent_interacting`
- **Reset button click** - `reset_button_clicked`

## Data Layer Format

All events are pushed to `window.dataLayer` in this format:

```javascript
window.dataLayer.push({
  event: "event_name",
  property1: "value1",
  property2: "value2",
  timestamp: 1234567890123
});
```

## GTM Configuration

In Google Tag Manager, you can create triggers based on these events:

1. **Trigger Type:** Custom Event
2. **Event Name:** `interaction_started`, `shape_dragged`, etc.
3. **Variables:** Access event properties like `shape_label`, `total_drags`, etc.

### Example GTM Tag Configuration

**Tag:** Google Analytics: GA4 Event
- **Event Name:** `hero_shapes_interaction`
- **Event Parameters:**
  - `shape_label`: `{{shape_label}}`
  - `total_drags`: `{{total_drags}}`
  - `interaction_duration_ms`: `{{interaction_duration_ms}}`

**Trigger:** Custom Event
- **Event Name:** `shape_dragged`

## Session Behavior

- **Session Scope:** All tracking is per-page-session
- **State Persistence:** State resets on page reload
- **No Duplicates:** `interaction_started` and `first_shape_dragged` fire only once
- **Counter Reset:** `total_drags` resets on page reload

## Performance Considerations

- **Non-Blocking:** All tracking is asynchronous
- **Lightweight:** Minimal state management overhead
- **No Physics Impact:** Tracking doesn't interfere with Matter.js calculations
- **Efficient:** Uses Set for unique shape tracking (O(1) lookups)

## Testing

To test the tracking system:

1. Open browser console
2. Check `window.dataLayer` array for pushed events
3. Or use GTM Preview mode to see events in real-time
4. Interact with shapes to trigger events

### Console Testing

```javascript
// Check if dataLayer exists
console.log(window.dataLayer);

// Filter for hero shapes events
window.dataLayer.filter(e => e.event && e.event.includes('shape') || e.event === 'interaction_started');
```

## Event Flow Example

1. User drags shape - `interaction_started` fires
2. Same drag - `first_shape_dragged` fires
3. Same drag - `shape_dragged` fires (total_drags: 1)
4. User drags another shape - `shape_dragged` fires (total_drags: 2)
5. User stops for 3 seconds - `time_spent_interacting` fires
6. User clicks reset - `reset_button_clicked` fires
