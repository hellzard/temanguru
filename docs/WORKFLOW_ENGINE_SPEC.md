# Workflow Engine Specification

## Goal

Allow schools to digitize common approval flows without code while keeping scope controlled and auditable.

## Building blocks

### Form schema
Supported field types:
- short text
- long text
- number/currency
- date/datetime
- select/multi-select
- checkbox
- file attachment
- user/member
- class
- room
- asset

### Workflow states
- draft
- submitted
- assigned
- in_review
- changes_requested
- approved
- rejected
- finalized
- cancelled

### Step types
- submitter action
- review by role/user
- approval
- document generation
- number allocation
- notification
- archive

## Rules MVP

- sequential approvals only
- no arbitrary code execution
- limited conditional rules using validated expressions
- immutable workflow version after first submission
- instance remains bound to its starting version

## Audit events

- created
- edited
- submitted
- assigned
- commented
- changes_requested
- approved/rejected
- generated
- finalized
- downloaded
- revoked

## Permissions

Every workflow template and instance belongs to one school. RLS must verify membership and action permission. Approver assignment must not be trusted from client input.

## Starter workflows

- request school letter
- teacher leave/absence request
- room booking approval
- equipment borrowing
- activity proposal
- repair request
- signature request

## Acceptance criteria

A teacher can submit a request, reviewer can request changes, teacher can revise, reviewer can approve, final document can be generated, and all events can be reviewed chronologically.
