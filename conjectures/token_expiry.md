# Shorter Token Expiry

## Problem
Current access tokens last 60 minutes in `create_access_token`. This may be too long for small sessions and could expose accounts if a token leaks.

## Tentative Approach
Make the expiry configurable via an environment variable (e.g., `TOKEN_MINUTES`).
Use this value when generating tokens so we can tweak durations without code changes.

## Initial Reasoning
Adjustable expiry lets us experiment with trade-offs between convenience and security. It also encourages documentation of why a specific duration was chosen.

## Status
Implemented. `create_access_token` now uses the `TOKEN_MINUTES` environment
variable when no explicit expiry is given.

