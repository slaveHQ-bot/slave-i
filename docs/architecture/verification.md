# Verification System

## Principle

Execution is not proof of success.

A tool can return successfully while the desired outcome is not achieved.

## Verification levels

unknown
unverified
partially_verified
verified
high_confidence
user_confirmed

## Verification strategies

- deterministic state check
- file existence/content check
- schema validation
- command output validation
- source comparison
- independent agent
- second model
- user approval

## Risk-based policy

Low-risk tasks may use lightweight verification.

High-impact tasks should use stronger verification and/or user confirmation.

## Final response

Main Slave should report meaningful uncertainty instead of fabricating certainty.
