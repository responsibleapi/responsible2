---
name: spikes
description:
  Use when planning, adding, editing, or reviewing proof-driven exploration
  under spikes/**. Before writing spike notes, ask the human for explicit
  success criteria. Only draft criteria yourself if the human explicitly allows
  it, then get approval before exploring or editing markdown.
---

# Spikes

Use this skill for proof-driven exploration under `spikes/**`.

## Workflow

1. If a task touches `spikes/**`, stop before writing or editing spike notes.
2. Ask the human for explicit success criteria for the exploration.
3. If the human explicitly allows agent-defined criteria, draft them first.
4. Ask the human to approve or edit drafted criteria.
5. Only after approval, explore and write findings in `.md`.
6. Tie every conclusion to evidence.
7. Verify each approved criterion is answered, disproven, or marked unresolved.
8. Report criterion-by-criterion status.

## Success Criteria Rules

- Criteria must be concrete enough to verify from the written spike.
- Criteria should describe what the exploration must prove, disprove, or leave
  unresolved.
- If criteria are vague, ask the human to clarify before writing spike notes.
- Do not silently add extra goals. Ask first.

## Spike Notes

- Prefer Markdown.
- Keep notes evidence-first: observations, links, code references, commands,
  outputs, and conclusions.
- Separate facts from recommendations.
- Mark unresolved questions explicitly.
