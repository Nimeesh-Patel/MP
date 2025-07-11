# Shorter Token Expiry

## Problem
Current access tokens last 60 minutes in `create_access_token`. This may be too long for small sessions and could expose accounts if a token leaks.

## Tentative Approach
Make the expiry configurable via an environment variable (e.g., `TOKEN_MINUTES`). Use this value when generating tokens.

## Initial Reasoning
Adjustable expiry lets us experiment with trade-offs between convenience and security. It also encourages documentation of why a specific duration was chosen.

