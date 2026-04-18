# Pachca Compiler Plan

## Goal

- Implement compiler behavior needed by Pachca translation.
- Keep all code changes scoped to `src/compiler/`.

## Files Studied

- `src/compiler/index.ts`
- `src/compiler/schema.ts`

## Primary Compiler Change

- Make root `responsibleAPI({ security })` emit document-level OpenAPI
  `security`.
- Register security schemes through root `security` too, so `partialDoc` does
  not need raw auth metadata.

## Current Compromise

- Compiler drops unused components.
- Pachca golden example still contains at least one unused schema component.
- `responsibleAPI({ missingSchemas })` exists as temporary compromise for
  fixture parity.

## Why This Matters

- `pachca.ts` should be able to express top-level auth via DSL alone.
- Exact top-level `security` parity should come from compiler behavior, not new
  example-only conventions.
- Root auth should use dedicated document DSL field, not overload inherited
  operation-level security semantics.
- Golden example parity should not depend on `missingSchemas`.

## Scope Boundaries

- Only `src/compiler/*`.
- No edits in `src/examples/`.
- DSL signature already added; this plan covers compiler behavior only.

## Suggested Implementation

1. Start by writing `src/compiler/security.test.ts` covering root and nested
   security behavior.
2. Trace current handling of root `security` in compiler.
3. Emit document-level `security` from root `responsibleAPI({ security })`.
4. Preserve existing per-operation emission for nested scopes and operation
   overrides.
5. Ensure security schemes referenced through root `security` are registered in
   generated components.

## Validation

- Use `src/compiler/security.test.ts` as primary verification target.
- Verify root `security` compiles to top-level OpenAPI `security`.

## Explicit Non-Goals

- No raw-schema escape hatch.
- No typed `extensions` support.
- No permanent reliance on `missingSchemas` as compiler behavior.

## Follow-Up For Example Work

- Once root auth behavior lands, `src/examples/pachca.ts` can rely on root
  `security` for exact document-level auth parity.
- Once unused-schema retention behavior is decided, `src/examples/pachca.ts`
  should stop relying on `missingSchemas`.
