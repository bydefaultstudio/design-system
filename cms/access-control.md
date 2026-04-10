---
title: "Access Control"
subtitle: "Managing user authentication and page permissions"
description: "How to manage user logins, roles, and page-level access control using Netlify Identity."
section: "Docs"
layer: "app"
subsection: "Site Management"
order: 1
status: "published"
access: "admin"
client: "internal"
---

This site uses **Netlify Identity** for authentication. Users are invited by email, assigned a role, and can only access pages permitted by their role.

## Access Levels

There are four access levels, from lowest to highest privilege:

| Level | Description |
|-------|-------------|
| **Public** | No login required — anyone can view |
| **Client** | Requires login with `client` role or higher |
| **Team** | Requires login with `team` role or higher (default) |
| **Admin** | Requires login with `admin` role only |

Higher roles inherit access from lower roles. An admin can see everything a team member can see, and a team member can see everything a client can see.

## Single Source of Truth

All access rules live in **markdown frontmatter**. This is the only place access is configured — not in JavaScript, not in theme config files.

The doc generator reads frontmatter and outputs `data-access` attributes on the HTML. The auth script reads those attributes at runtime and enforces them.

```
frontmatter (cms/*.md) → generator → data-access (HTML) → auth.js (runtime)
```

## Page Access Configuration

### Standard roles

```yaml
access: "public"    # No login required
access: "client"    # Any client or higher
access: "team"      # Team members and admins (default)
access: "admin"     # Admins only
```

Pages without an `access` value inherit from `_defaults.md` in their folder (see below). If no defaults file exists, the fallback is `team`.

### Per-client access

To restrict a page to specific clients, use the `client:` prefix with a comma-separated list of client folder names:

```yaml
access: "client:dianomi"              # Only the "dianomi" client
access: "client:dianomi,acme"         # "dianomi" or "acme" clients
access: "client:dianomi,acme,globex"  # Any of these three clients
```

Team and admin users always have access regardless of the client list. The client folder names must match the `clientFolder` value in the user's Netlify Identity `app_metadata`.

### On standalone HTML pages

Set the attribute directly on `<body>`:

```html
<body class="auth-loading" data-access="client:dianomi,acme">
```

## Folder Defaults (`_defaults.md`)

Any directory in `cms/` can contain a `_defaults.md` file that sets default frontmatter values for all sibling markdown files in that directory. This works like Notion's inherited permissions — set it once at the folder level, override per-page when needed.

### How it works

1. The generator checks for `_defaults.md` in the same directory as the page being processed
2. Default values are merged — **page frontmatter always wins** over folder defaults
3. `_defaults.md` files are never generated into HTML pages (skipped during generation)

### Current defaults

```yaml
# cms/_defaults.md
---
access: "team"
---

# cms/clients/dianomi/_defaults.md
---
access: "client:dianomi"
---

# cms/clients/client-template/_defaults.md
---
access: "client:client-template"
---
```

This means:
- All main docs default to **team** access
- All dianomi pages default to **client:dianomi** access
- All client-template pages default to **client:client-template** access
- Any page can override its folder default with an explicit `access:` in its own frontmatter

## Tool Access

Tools have two access levels — one for the **documentation page** and one for the **tool app** itself:

```yaml
# cms/calculator-docs.md
---
access: "admin"                              # doc page: admin only
toolUrl: "../tools/cpm-calculator.html"
toolAccess: "public"                         # tool app: anyone
---
```

- `access` controls who can see the documentation page
- `toolAccess` controls who sees the tool card in section overviews and who can access the tool app page

The standalone tool HTML pages (`tools/*.html`) must have a matching `data-access` attribute on their `<body>`:

```html
<!-- tools/cpm-calculator.html -->
<body class="auth-loading" data-access="public">

<!-- tools/display-ad-preview.html -->
<body class="auth-loading" data-access="client:dianomi,client-template">
```

When adding a new client that should see a tool, update the `toolAccess` field in the markdown file **and** the `data-access` attribute on the tool HTML page.

## Managing Users

Users are managed in the **Netlify Dashboard**:

1. Go to your site in the [Netlify Dashboard](https://app.netlify.com)
2. Navigate to **Integrations** → **Identity**
3. Click **Invite users** to send email invitations

### Assigning Roles

After a user accepts their invitation, edit their profile in the Identity panel to set their role:

1. Click on the user in the Identity list
2. Under **Metadata**, edit the `app_metadata` field
3. Set the role:

```json
{
  "roles": ["admin"]
}
```

Available roles: `admin`, `team`, `client`.

### Client Folder Access

Client users need a role that identifies which client folder they belong to. The simplest way is to add the **client folder name as a role tag** in the Netlify UI:

**Option A — Single tag (recommended)**

Add just the client name as a role tag (e.g. `dianomi`). The system automatically treats any non-hierarchy role as a client folder name and assigns the `client` access level.

**Option B — Two tags (explicit)**

Add both `client` and the client name as tags (e.g. `client` + `dianomi`). This is more explicit but functionally identical.

**Option C — API (app_metadata)**

If using the Netlify API, you can set `clientFolder` explicitly:

```json
{
  "roles": ["client"],
  "clientFolder": "dianomi"
}
```

All three options produce the same result: the user can access pages with `data-access="client:dianomi"` (or `public`). They cannot see pages scoped to other clients.

Team and admin users can access all client folders.

## Adding a New Client

1. Create `cms/clients/acme/_defaults.md`:
   ```yaml
   ---
   access: "client:acme"
   ---
   ```
2. Create `cms/clients/acme/welcome.md` (copy from client-template)
3. Add theme entry in `assets/js/theme-config.js` (css, fonts, label, pages — no access config)
4. Update shared pages the client should see: add `acme` to `toolAccess` comma lists in the relevant `cms/*.md` files
5. Update the matching tool HTML pages: add `acme` to `data-access` on `<body>`
6. Run `npm run docgen`

## Adding a New Page

1. Create the page as usual
2. Set the `access` frontmatter (for docs) or `data-access` attribute (for standalone HTML)
3. If the page is in a folder with `_defaults.md`, you can omit `access:` to inherit the default
4. Run `npm run docgen` if it's a docs page
5. Deploy — the auth script handles the rest

## Element-Level Visibility

Individual elements on a page can be shown or hidden based on the user's role. Add a `data-auth-role` attribute to any HTML element:

```html
<!-- Only visible to admin -->
<div data-auth-role="admin">
  This content is only visible to administrators.
</div>

<!-- Visible to team and above -->
<div data-auth-role="team">
  This content is visible to team members and admins.
</div>

<!-- Visible to everyone (no login needed) -->
<div data-auth-role="public">
  This content is always visible.
</div>
```

Role inheritance applies: an admin can see elements marked `team` or `client`.

## Login and Logout

- **Login**: The Netlify Identity widget opens automatically on protected pages when no user is logged in. A login button is also available in the sidebar.
- **Logout**: A logout button appears in the sidebar when logged in. Clicking it clears the session and redirects to the homepage.

## Future Enhancements

### Server-Side Enforcement

The frontmatter schema maps directly to Netlify redirect rules for server-side enforcement:

| Frontmatter | Netlify Role Condition |
|---|---|
| `access: "public"` | No rule needed |
| `access: "team"` | `Role = ["team", "admin"]` |
| `access: "admin"` | `Role = ["admin"]` |
| `access: "client:dianomi"` | `Role = ["client-dianomi", "team", "admin"]` |

A build script could auto-generate `netlify.toml` redirect rules from frontmatter.

### Per-User Access

When needed, extend the frontmatter syntax:

```yaml
access: "user:erlen@bydefault.studio,jane@dianomi.com"
```

This would require storing allowed emails in Netlify Identity metadata and checking against them in auth.js.

## Security Notes

- On the free Netlify tier, authentication is enforced **client-side**. The HTML is still served to all visitors, but the JavaScript hides content from unauthenticated or unauthorised users.
- This is appropriate for internal documentation. It is **not** suitable for highly sensitive data.
- For true server-side protection, upgrade to Netlify Pro and add role-based redirect rules in `netlify.toml`.

## Troubleshooting

### User can't log in
- Ensure Identity is enabled in the Netlify Dashboard
- Check that the user has been invited and has accepted their invitation
- Verify the user's `app_metadata` contains a valid `roles` array

### User sees "Access Denied" unexpectedly
- Check the user's role tags in the Netlify Identity dashboard
- Verify the page's `data-access` attribute matches the user's role
- For client users, ensure one of their role tags matches the client name in `data-access="client:name"` (e.g. a user with the `dianomi` tag can access `data-access="client:dianomi"`)

### Auth not working locally
- Netlify Identity requires a deployed Netlify site. Use `netlify dev` for local testing with Identity support.
