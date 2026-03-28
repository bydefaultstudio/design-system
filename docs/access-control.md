---
title: "Access Control"
subtitle: "Managing user authentication and page permissions"
description: "How to manage user logins, roles, and page-level access control using Netlify Identity."
section: "Admin"
order: 1
access: "admin"
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

Client users can be restricted to their own folder. Add a `clientFolder` field to their `app_metadata`:

```json
{
  "roles": ["client"],
  "clientFolder": "dianomi"
}
```

This user will only be able to access pages inside the `/dianomi/` folder, plus the shared tool pages (CPM Calculator, SVG Cleaner, Display Ad Preview).

Team and admin users can access all client folders.

## Page Access Configuration

Page access is configured in `assets/js/auth-config.js`. Each page can be mapped to a minimum required role:

```js
pageRoles: {
  // Public pages
  'some-page.html': 'public',

  // Client pages
  'cpm-calculator/index.html': 'client',

  // Admin pages
  'access-control.html': 'admin',
}
```

Pages **not listed** in the config default to `team` access (configurable via `defaultRole`).

### Adding a New Page

1. Create the page as usual
2. If it needs a non-default access level, add it to `pageRoles` in `auth-config.js`
3. Deploy — the auth script handles the rest

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
- Check the user's role in the Netlify Identity dashboard
- Verify the page's required role in `auth-config.js`
- For client users, ensure `clientFolder` matches the folder path exactly

### Auth not working locally
- Netlify Identity requires a deployed Netlify site. Use `netlify dev` for local testing with Identity support.
