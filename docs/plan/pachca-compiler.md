# Pachca Compiler Plan

## Goal

- fix `bun check`
- Do `normalize()` work first.
- Do compiler work second.
- Do not edit golden files in `src/examples/*.json` or `src/examples/*.yaml`.

## Files Studied

- `src/help/normalize.ts`
- `src/help/normalize.test.ts`
- `src/compiler/index.ts`
- `src/compiler/emit-schema.ts`
- `src/compiler/request.ts`

## Findings

- `pachca.test.ts` compares `normalize(validateDoc(theAPI))` against
  `normalize(theJSON)`.
- Because both sides pass through `normalize()`, `normalize()` must accept
  Pachca golden shapes before compiler parity work can finish.
- `normalize()` currently throws on arrays like `[null]`.
- Pachca goldens already contain `[null]` in schema `examples`.
- Root `responsibleAPI({ security })` already emits top-level OpenAPI
  `security`.
- Root `security` already registers `components.securitySchemes`.
- `security` is not current Pachca blocker.
- Compiler still has separate defect in schema emission for nullable typed
  schemas.

## Actual Normalize Bug

- `normVal()` supports arrays of strings, numbers, booleans, arrays, security
  requirement objects, and plain objects.
- Homogeneous null arrays do not match any supported branch.
- Result: `normalize()` throws `Invalid value for [null]`.
- Pachca repro:
  `components.schemas.AccessTokenInfo.properties.revoked_at.examples` in golden
  JSON contains `[null]`.

## Actual Compiler Bug

- `nullable(array(...))`, `nullable(object(...))`, and nullable dict-like
  schemas keep tuple `type` values such as `["array", "null"]`.
- `emitRawSchemaValue()` only recurses when `schema.type` is plain string.
- Result: nested named thunks can leak into final document instead of being
  lowered to `$ref`.
- Pachca repro: `components.schemas.Message.properties.buttons.items.items`
  becomes function `Button`, which makes OpenAPI validation fail.

## Why This Matters

- Current Pachca path has two blockers, not one.
- `normalize()` failure masks fixture parity work even after compiler fix.
- Pachca output must be pure OpenAPI data, no function values.
- Both fixes belong in code, not in example source and not in goldens.
- Same defect can affect any nullable typed schema with nested named refs, not
  just Pachca.

## Scope Boundaries

- `src/help/normalize.ts` and `src/help/normalize.test.ts` first.
- `src/compiler/*` second.
- No edits in `src/examples/`.
- No edits in golden `src/examples/*.json` or `src/examples/*.yaml`.
- No DSL signature changes.

## Suggested Implementation

1. Add regression in `src/help/normalize.test.ts` for schema `examples: [null]`
   and assert `normalize()` preserves it.
2. Update `normVal()` to accept homogeneous null arrays without reordering them.
3. Run `bun test src/help/normalize.test.ts`.
4. Add regression in `src/compiler/emit-schema.test.ts` for
   `nullable(array(array(Button), { examples }))`.
5. Update `emitRawSchemaValue()` to derive effective non-null structural type
   when `schema.type` is tuple containing `"null"`.
6. Preserve existing emitted `type` array in output, but recurse into nested
   `items`, `properties`, and `additionalProperties`.
7. Re-run Pachca validation to confirm final document contains no function
   values and fixture normalization no longer throws.

## Validation

`bun check`

## Explicit Non-Goals

- No edits to Pachca golden JSON or YAML.
- No new raw-schema escape hatch.
- No DSL API changes.
