## Page metadata

| Field | Copy | Limit |
| --- | --- | --- |
| Title | Contact — By Default | 50–60 chars (currently 20 — too short) |
| Meta description | Get in touch with By Default. Tell us about your project and we'll be in touch. | 150–160 chars (currently 79 — too short) |
| OG title | Contact — By Default | — |
| OG description | (same as meta description) | — |
| OG image alt | By Default — Contact | — |
| Twitter description | Get in touch with By Default. | 150–160 chars (currently 29 — far shorter than meta description) |

---

## Page header (persistent top bar — L1+ pages)

`Eyebrow`

Contact

`Close button`

ESC (a11y label: **Close**) → /index.html

---

## Section 01 - Form

`Headline`

(h1): Get in touch

`Field 1 — Name`

- Label: **Hey, my name is**
- Placeholder: **your full name**

`Field 2 — Email`

- Label: **and you can reach me at**
- Placeholder: **your email address**
- Valid-email a11y label (tick icon): **Valid email**

`Field 3 — Type chips (single-select)`

- Label: **I'm here about**
- Options:
  1. **a new project**
  2. **a product**
  3. **a general enquiry**
- Group a11y label: **What you're here about**

`Field 4 — Message`

- Label: **Your message**
- Placeholder: **Type your message…**

`Submit button (state-driven)`

- Default: **Send message**
- Loading: **Sending…**
- Sent: **Sent**

`Network error callout (hidden until needed)`

That didn't go through. Check your connection and try again, or email us directly at [hello@bydefault.studio](mailto:hello@bydefault.studio).

---

## Section 02 - Success state

`Heading (default)`

(h2): Message sent.

`Heading (personalised after submission)`

(h2): Thanks {name}.

`Body`

Your message was sent. We'll have a read and come back to you asap!

`Recommendations label`

(h3): While you wait

Recommendations are dynamic — pulled from `studio/assets/data/studio-content.json`. Each item is labeled **Article** or **Case study** depending on type.

---

## Validation messages (live-validated per field)

`Name`

- Empty: **Please enter your name so we know who we're talking to.**
- Too short: **Your name needs to be at least {N} characters.**
- Server-side rejection (alt phrasing): **We need your name to know who we're talking to.**

`Email`

- Empty: **Please enter your email address so we can get back to you.**
- Invalid format: **That doesn't look like a valid email address. Please check and try again.**
- Server-side rejection: **That doesn't look quite right — check the email address.**

`Type`

- Nothing selected: **Pick one so we know how to route this.**

`Message`

- Empty: **Tell us a sentence or two so we can prepare for the conversation.**

---

## Reassurance signal (JS-injected near the form)

You're in the right place. Takes 60 seconds — we reply within one business day.
