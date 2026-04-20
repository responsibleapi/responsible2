# YouTube Investigation

## Goal

- understand why `src/examples/youtube.test.ts` fails
- identify dominant mismatch shape before changing compiler
- avoid touching `src/examples/*.json`

## Command Run

- `bun test src/examples/youtube.test.ts`

## Current Result

- `youtube.json is valid` passes
- `emit youtube.compiled.json` passes
- `youtube.json validates as OpenAPI` fails
- current compiler intentionally emits `requestBody.required: true` whenever
  `req.body` is present

## Most Common Mismatch

Matched by parameter name and location against `youtube.json`:

- `213` cases: expected puts `description` on parameter object, compiled output
  puts same text on `schema.description`
- `69` cases: expected has explicit `style: "form"`, compiled output omits it
- `69` cases: expected has explicit `explode: true`, compiled output omits it
- `31` cases: compiled output adds `requestBody.required: true`
- `46` remaining diffs: mostly fixture text drift or ordering/noise after larger
  structural differences

## Examples

- `/youtube/v3/abuseReports` `post` query param `part`
  - expected:
    - parameter-level `description`
    - explicit `style: "form"`
    - explicit `explode: true`
  - actual:
    - `description` moved under `schema.description`
    - `style` omitted
    - `explode` omitted
- `/youtube/v3/captions` `post`
  - expected request body omits `required`
  - actual emits `required: true`

## Probable Root Cause

Main issue looks like shape mismatch between old `youtube.json` golden and
current compiler behavior.

Reason:

- request compiler already has regression coverage showing non-optional
  `req.query` keys emit `required: true`
- dominant failures line up with bare-schema parameter compilation
  - bare schemas keep metadata nested under `schema`
  - explicit serialization fields only appear when using inline param wrappers
- this behavior already has direct regression coverage in
  `src/compiler/request.test.ts`
- request body emission is currently hard-coded in `src/compiler/index.ts`
  - if `merged.body` exists, compiler emits `requestBody.required: true`
- `youtube.json` is not a repo-wide policy signal
  - other example goldens already include `requestBody.required: true`
  - YouTube is the outlier: `0/31` request bodies mark `required: true`

Relevant compiler path:

- [src/compiler/request.ts](/Users/adelnizamutdinov/Projects/responsibleapi/src/compiler/request.ts:30)
  - `compileLegacyMapParameterFields()` preserves bare-schema metadata under
    nested `schema`
- [src/compiler/request.ts](/Users/adelnizamutdinov/Projects/responsibleapi/src/compiler/request.ts:324)
  - `compileMapParameter()` only emits `style` / `explode` from inline param
    wrappers
- [src/compiler/index.ts](/Users/adelnizamutdinov/Projects/responsibleapi/src/compiler/index.ts:794)
  - `compileRequestBody()` always emits `required: true` when body exists
- [src/dsl/operation.ts](/Users/adelnizamutdinov/Projects/responsibleapi/src/dsl/operation.ts:36)
  - current DSL has `body?: ...`, which means body config may be absent, not
    that declared body is optional

## Working Theory

- `youtube.ts` uses many query/path params as bare `Schema` values
- `youtube.json` still expects older parameter emission
  - wrapper-style `description`
  - explicit default query serialization fields
- request body mismatch is real DSL/compiler gap
  - current DSL cannot express optional request body
  - compiler therefore cannot omit `requestBody.required`

## DSL Decision

- optional request bodies will use key optionality, same family as query/header
  maps
- chosen shape: `req: { "body?": Schema | Record<Mime, Schema> }`
- this is intentional `@dsl` surface change
- compiler target:
  - `body` emits `requestBody.required: true`
  - `"body?"` emits `requestBody` without `required`

## Scope Implication

- this is not just normalization
- this requires coordinated DSL and compiler work
  - extend request input shape
  - thread body optionality through merge/compile path
  - add focused regression coverage
  - update `src/examples/youtube.ts` to use `"body?"` where golden omits
    `requestBody.required`

## Next Useful Checks

1. Design `OpReq` / `ReqAugmentation` shape for `body` plus `"body?"`.
2. Update merge logic so optional-vs-required body survives inheritance.
3. Update `compileRequestBody()` to emit `required` only for required body.
4. Add focused tests before touching YouTube example.
5. Then map YouTube operations that should switch from `body` to `"body?"`.

## Non-Claims

- not yet implemented
- parameter-shape mismatches still exist separately from request-body mismatch
- no code changes landed from this investigation
