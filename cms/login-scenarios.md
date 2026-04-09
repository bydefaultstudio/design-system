---
title: "Login Scenarios"
subtitle: "Auth flow testing and login states"
description: "Reference page for testing all authentication flows — login, forgot password, reset, invitation, and confirmation."
section: "Docs"
subsection: "Dev"
order: 4
status: "published"
access: "admin"
client: "internal"
---

Use these links to test each authentication flow during development. Each link simulates a specific login state by passing the appropriate URL hash.

## Login States

| Scenario | URL | Description |
|---|---|---|
| Login | [/auth/login.html](../auth/login.html) | Standard email/password login form |
| Forgot Password | [/auth/login.html#forgot](../auth/login.html#forgot) | Password recovery request form |
| Reset Password | [/auth/login.html#recovery_token=dev](../auth/login.html#recovery_token=dev) | Password reset form (simulated token) |
| Accept Invitation | [/auth/login.html#invite_token=dev](../auth/login.html#invite_token=dev) | New user invitation acceptance |
| Email Confirmation | [/auth/login.html#confirmation_token=dev](../auth/login.html#confirmation_token=dev) | Email verification confirmation |

## Other Auth Pages

| Page | URL | Description |
|---|---|---|
| Account | [/auth/account.html](../auth/account.html) | User account management page |
| Access Denied | [/access-denied.html](../access-denied.html) | Shown when a user lacks permission |
