# Explanations

This document records key insights or theories that emerge as the project
evolves. When a conjecture withstands criticism or leads to a better design,
the reasoning can be summarised here for future contributors.

These explanations inform the main [`README.md`](README.md).  When major ideas
change, the README is revised so newcomers begin with our latest understanding.

## Why a Social Media Prototype?

Building a simple Twitter-like service gives us a concrete context for
exploring Popperian ideas about open criticism. Features such as user
registration or content moderation are approached as provisional solutions that
may be replaced once we find better explanations. Recording those insights here
helps new contributors understand the path of ideas.

## The Role of Testing

Automated tests serve as conjectures about how the code should behave. When
a test fails, it acts as immediate criticism that guides us toward a better
explanation or implementation. Maintaining even small test suites keeps the
project improvable and documents expected behaviour for newcomers.

## Configurable Token Expiry

Access tokens are now created with a default expiry specified by the
`TOKEN_MINUTES` environment variable. This grew out of the conjecture about
shorter token lifetimes. Making the duration configurable lets us experiment
with security versus convenience without changing code.

