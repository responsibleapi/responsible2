# AGENTS.md

## Current state of things

- DO NOT attempt to run tests.
- Use typechecking and linting for guidance

## Tools

- use `bun` for everything
- never use `bunx`, if a package is missing, ask to add it to `package.json`
- never use `node`
- never use `prettier` or other formatting tools, just don't bother

## Docs

- field-by-field `package.json` rationale lives in `docs/package.jsonc`

## TODO

### DSL

`readme.json` uses operation summaries, per-operation tags, reusable
components/refs, and auth/security output that the current DSL/compiler surface
does not emit yet. I’m still patching the parts readme.ts can already model
directly: concrete request/response schemas and schema text mismatches.

### Compiler

Single pass compiler design:

Each nested level inherits and extends the context, and as you return up the
stack, you merge the generated OpenAPI paths. No AST needed - just function
calls and return values
