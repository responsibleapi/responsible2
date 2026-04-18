# Pachca Compiler Status

## Goal

- fix `bun check`
- compiler output must match Pachca goldens
- do not edit `src/examples/`
- do not edit golden files in `src/examples/*.json` or `src/examples/*.yaml`

## Files Touched

- `src/compiler/index.ts`
- `src/compiler/request.ts`
- `src/compiler/emit-schema.ts`
- `src/compiler/request.test.ts`
- `src/compiler/response.test.ts`
- `src/compiler/emit-schema.test.ts`
- `src/help/normalize.ts`
- `src/help/normalize.test.ts`

## Work Completed

### Compiler

- preserved operation-level vendor extensions in `compileDirectOp()`
  - emitted `x-*` own properties such as `x-requirements` and `x-paginated`
- changed reusable parameter emission to stay inline at use-sites
  - stopped emitting `components.parameters`
  - stopped emitting parameter `$ref` use-sites
- changed reusable response header emission to stay inline at use-sites
  - stopped emitting `components.headers`
  - stopped emitting header `$ref` use-sites
- normalized named response header key derivation
  - `link` still emits `Link`
  - `LocationHeader` now emits `location`
- removed compiler-added default query serialization noise
  - no automatic `style: "form"`
  - no automatic `explode: true`
- preserved parameter-level examples when the schema itself is a `$ref`
  - compiler now copies the use-site example onto the emitted schema object too
- reworked nullable composed-schema emission
  - nullable `allOf(...)` now stays a typed nullable schema
  - output keeps top-level `type: ["object", "null"]` with `allOf`
  - compiler no longer wraps this case in outer `anyOf`
- synthesized `examples: [null]` for nullable leaf schemas that had no example data
  - intentionally skipped nullable object/array/composed shapes

### Tests Added Or Updated

- `src/compiler/request.test.ts`
  - inline named reusable params
  - inline params with `$ref` schemas preserve examples
  - path-item params stay inline
  - operation-level `x-*` extensions preserved
  - removed expectations for compiler-added query `style`/`explode`
- `src/compiler/response.test.ts`
  - inline reusable response headers
  - `LocationHeader` name mapping
  - repeated named headers stay inline across routes
- `src/compiler/emit-schema.test.ts`
  - nullable `allOf` collapses to typed nullable schema
  - nullable leaf schemas synthesize `examples: [null]`
  - nullable objects do not synthesize null examples

## Validation Completed

- passed `bun test src/compiler/request.test.ts`
- passed `bun test src/compiler/response.test.ts`
- passed `bun test src/compiler/emit-schema.test.ts`
- passed `bun test src/examples/pachca.test.ts`

## What Changed After Pachca Passed

- Pachca no longer failed on compiler drift that originally motivated this work.
- The remaining failures moved to other examples and suite expectations that were
  still encoded around the old compiler shape:
  - fixtures expecting `components.parameters` plus `$ref` use-sites
  - fixtures expecting default query `style: "form"` / `explode: true`
  - fixtures that omit `deprecated: false`
  - compiler tests that still asserted `components.parameters` directly

## Normalize Follow-Up Started

This was follow-up compatibility work after the compiler changes, not the
original Pachca fix itself.

### Landed

- `normalize.ts` now treats explicit empty `parameters: []` as absent
- `normalize.ts` now omits `deprecated: false` on operation-shaped objects
  - this must stay limited to `false`
  - do not ever normalize away `deprecated: true`
- `normalize.test.ts` now covers:
  - empty `parameters: []` equivalence
  - component-parameter-ref vs inline-parameter equivalence
  - omission of `deprecated: false`

### Still Open

- normalize support for old `components.parameters` + `$ref` fixtures is not
  fully implemented yet
- normalize support for default query param `style: "form"` /
  `explode: true` equivalence is not fully implemented yet
- `src/compiler/large-examples.test.ts` still encodes the old
  `components.parameters` behavior directly and will need separate handling

## Current State

- Pachca compiler parity work is implemented.
- The compiler now emits Pachca-compatible operation extensions, inline params,
  inline response headers, and nullable schema shapes.
- The repo is not fully green yet because the broader suite still contains
  expectations from the pre-change compiler shape.

## Remaining Work

1. Finish the normalize compatibility layer for legacy fixtures that still use
   `components.parameters` and parameter `$ref`s.
2. Normalize away default query `style: "form"` / `explode: true` where those
   are semantically default.
3. Update or replace direct old-shape assertions in
   `src/compiler/large-examples.test.ts`.
4. Rerun:
   - `bun test src/help/normalize.test.ts`
   - `bun test src/examples/readme.test.ts`
   - `bun test src/examples/youtube.test.ts`
   - `bun test src/examples/listenbox.test.ts`
   - `bun check`

## Explicit Non-Goals

- no edits to Pachca golden JSON or YAML
- no edits to Pachca TypeScript example source
- no DSL API changes
- no normalization rule that drops `deprecated: true`
