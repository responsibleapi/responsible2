# `youtube.ts` param-mismatch fix plan

## Goal

Make `src/examples/youtube.ts` model raw OAS path items directly.

The current file is mixing two different ideas:

- one `scope` as an exact OAS `PathItem`
- one `scope` as a URL-prefix grouping convenience

That is what caused the captions regression:

- raw `"/youtube/v3/captions"` has path-level `parameters`
- current source already supplies the shared `11` path-level refs via the root
  `forAll.req.params`, which matches the golden
- current nested `"/{id}"` is a different raw path item, so it should not live
  under the captions path-item scope
- operation-level params are still easy to misplace when exact raw path items
  are blended with prefix-group scopes

## Facts To Build Around

- `src/examples/youtube.json` currently has `39` raw OAS path keys.
- Every one of those `39` path items has the same `11` path-level parameter
  refs:
  - `#/components/parameters/_.xgafv`
  - `#/components/parameters/access_token`
  - `#/components/parameters/alt`
  - `#/components/parameters/callback`
  - `#/components/parameters/fields`
  - `#/components/parameters/key`
  - `#/components/parameters/oauth_token`
  - `#/components/parameters/prettyPrint`
  - `#/components/parameters/quotaUser`
  - `#/components/parameters/upload_protocol`
  - `#/components/parameters/uploadType`
- Verified with `jq`: the file has `39` paths and `1` unique path-level
  parameter-ref list, so the shared-root interpretation is real, not inferred.

## Structural Direction

Use one exact OAS path item per `scope`.

That means:

- the root `forAll.req.params` should keep carrying the common `11` refs,
  because `jq` shows they are identical across all `39` raw path items
- do not force-copy those `11` refs into every exact path scope unless the raw
  JSON stops being uniform
- nested child paths should be promoted to sibling full paths whenever the raw
  OAS key is different
- prefix-level sharing that is not globally uniform should move to local
  helpers, not nested path scopes

In practice, later implementation should preserve the shared root-level `11`
refs and fix the exact-path structure around them. Do not change the DSL for
this.

## Paths That Must Be Promoted Out Of Parent Scopes

These are currently nested but are separate raw OAS path items and should become
sibling full-path entries:

- `/youtube/v3/captions/{id}`
- `/youtube/v3/comments/markAsSpam`
- `/youtube/v3/comments/setModerationStatus`
- `/youtube/v3/liveBroadcasts/bind`
- `/youtube/v3/liveBroadcasts/cuepoint`
- `/youtube/v3/liveBroadcasts/transition`
- `/youtube/v3/videos/getRating`
- `/youtube/v3/videos/rate`
- `/youtube/v3/videos/reportAbuse`
- `/youtube/v3/watermarks/set`
- `/youtube/v3/watermarks/unset`

Special case:

- `/youtube/v3/watermarks` is currently a synthetic prefix scope. It is not a
  raw OAS path key in `youtube.json`, so that scope should disappear entirely.

## Refactor Phases

### 1. Inventory first

Before touching code, use the golden file as the source of truth:

- `scc src/examples/youtube.ts`
- `jq -r '.paths | keys[]' src/examples/youtube.json`
- `jq -r '.paths | to_entries[] | [.key, ((.value.parameters // []) | map(if has("$ref") then ."$ref" else (.name // "<inline>") end) | join(","))] | @tsv' src/examples/youtube.json`
- `rg -n 'scope\\(|forAll:|\"/' src/examples/youtube.ts`

The point of this pass is to produce an exact mapping from:

- current top-level route key
- current nested child route key
- target full raw OAS path key

### 2. Preserve the shared path-item baseline

Then:

- keep those params in the root `forAll.req`
- keep root-level MIME defaults
- only add path-local `forAll.req.params` if raw JSON shows path-specific
  `PathItem.parameters` beyond the global `11`

This is the key model correction: each exact raw path item must compile to the
right effective `PathItem.parameters`, but identical global refs do not need to
be mechanically duplicated in source.

### 3. Reshape routes to one exact path item per `scope`

There are three cases:

- Exact multi-method paths:
  - keep them as scopes
  - keep relying on the shared root `11` unless that exact raw path has extra
    path-level params
- Nested child raw paths:
  - promote them to sibling full-path scopes
  - do not keep them nested under parent exact-path scopes
- Single-method direct paths:
  - wrap them in exact-path scopes when that helps the source mirror the raw
    `paths` object, not just to re-home the shared root `11`

This should make the source mirror the raw OAS `paths` object instead of a URL
prefix tree.

### 4. Rebuild operation-level params from raw JSON

After the path-item structure is correct, fix operation-level mismatches by
copying from raw `youtube.json`, not by inference.

Rule:

- `PathItem.parameters` in raw JSON maps to the effective path-item params for
  that exact source path after inheritance
- because raw `youtube.json` currently has one shared path-level param set
  across all `39` paths, root inheritance is acceptable for those `11` refs
- operation `parameters` in raw JSON stay inside the verb’s `req`
- shared query params like `onBehalfOf` only belong in path-level `forAll` if
  raw JSON actually puts them there

The captions block is the template:

- `/youtube/v3/captions` should still effectively get the shared `11` path-item
  refs from the root
- `DELETE` keeps only its operation-level extras:
  - `id`
  - `onBehalfOf`
  - `onBehalfOfContentOwner`
- `/youtube/v3/captions/{id}` becomes its own sibling exact-path scope with its
  own operations, while still effectively getting the same shared `11` refs

Do the same comparison for each promoted cluster:

- captions
- comments
- liveBroadcasts
- videos
- watermarks

### 5. Preserve sharing without reintroducing wrong scope semantics

Anything that was previously being shared through prefix nesting should move to
local helpers instead:

- shared tag arrays
- shared security helpers
- shared success response helpers
- shared operation param arrays where they are truly identical

Do not use parent path scopes for prefix reuse once path-item params are being
modeled explicitly. Root-level sharing that `jq` proves is universal across all
`39` raw paths is still fine.

## Tooling Plan

Use the existing CLI set first. It should be enough.

- `scc` for quick size estimation
- `jq` as the raw OAS source of truth
- `rg` for broad inventory and candidate lists
- `ast-grep` for structural search and preview of repetitive rewrites

Good `ast-grep` targets:

- find top-level route pairs whose value is a direct `GET(...)` / `POST(...)` /
  `PUT(...)` / `DELETE(...)` instead of a `scope(...)`
- find nested child path pairs inside existing `scope(...)` bodies
- preview repetitive wrapping or promotion candidates before editing

Use `ast-grep run` without `-U` first. Only apply a bulk rewrite after the
preview matches expectations.

## Optional Extra Tool

Not needed at the start, but if structural JSON diffs are still too noisy after
the refactor, consider:

- `brew install jd`

Use it only as a nicer JSON diff for compiled output vs golden. The core
refactor should still be driven by `jq`, `rg`, `ast-grep`, and the existing
test.

## Suggested Execution Order

1. Keep the shared root-level `11` path params and stop treating that sharing as
   the bug.
2. Fix captions end to end.
3. Promote the other nested child-path clusters:
   - comments
   - liveBroadcasts
   - videos
   - watermarks
4. Wrap remaining single-method direct paths into exact-path scopes.
5. Sweep operation-level mismatches against raw `youtube.json`.
6. Run verification.

Doing captions first is useful because it exercises all failure modes at once:

- confusion between effective path-item params and local placement in source
- wrong operation-level param distribution
- wrong nested child-path placement

## Verification

After implementation later, verify in this order:

1. `bun tsc`
2. `bun lint`

Also spot-check raw path-item `parameters` on a few representatives after each
cluster:

- `/youtube/v3/captions`
- `/youtube/v3/captions/{id}`
- `/youtube/v3/liveBroadcasts`
- `/youtube/v3/liveBroadcasts/bind`
- `/youtube/v3/videos`
- `/youtube/v3/videos/getRating`
- `/youtube/v3/watermarks/set`

## Success Criteria

The refactor is done when all of the following are true:

- each raw OAS path key in `youtube.json` has a matching exact-path source
  representation in `youtube.ts` ([scope merge behavior](src/dsl/scope.ts))
- each raw OAS path key gets the correct effective path-level params, whether
  supplied by the shared root `forAll` or by a path-local scope
- nested child raw paths are no longer hidden inside parent exact-path scopes
