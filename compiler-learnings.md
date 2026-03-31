# Compiler learnings (Story 3: nested scopes, paths, tags)

## Implemented behavior

- **Recursive walk**: `compileRoutes` visits every path key and method key;
  nested `scope()` nodes merge `forAll` and recurse into `node.routes` (the
  object returned by `scope()`, not a user-written `routes:` property inside the
  argument).
- **Path join**: `joinHttpPaths(prefix, segment)` normalizes a trailing slash on
  the prefix and concatenates absolute `HttpPath` segments, so `/v1` plus
  `/users/:userId` becomes `/v1/users/:userId`.
- **OpenAPI templates**: DSL `:param` segments are turned into `{param}` for
  emitted `paths` keys and for parameter name alignment; duplicate
  `(normalized path, method)` is rejected (for example `/a/:id` and `/a/{id}`
  map to the same item).
- **`forAll.req`**: Scope stacks merge like the plan: shallow maps for
  `pathParams` / `query` / `headers`, `params` concatenated, `mime` and `body`
  child-preferred; operation merge still uses `normalizeOpReq` and
  `readReqMimeRaw` on the op.
- **`forAll.res`**: `res.defaults` from ancestors is kept as an ordered list of
  layers; for each status, augmentations are folded per layer and combined so
  inner scopes can add headers or mime without flattening conflicting keys
  incorrectly. `res.add` maps are shallow-merged with the child winning on the
  same status code.
- **Tags**: Nearest `forAll.tags` on the scope stack wins; operation-level
  `tags` override scope tags. Emitted OpenAPI operation `tags` are the tag
  objects’ `.name` strings.
- **Path parameters**: Every `{name}` in the OpenAPI path must have a matching
  `pathParams` entry after merge; extra `pathParams` keys and optional-style
  keys (`name?`) are rejected.

## Deferred / not matching the long-form plan yet

- **`security` / `security?`**: Merging still follows plain object spread in
  `mergeReqAugmentations` (later scope or op replaces earlier `security` fields
  rather than appending compiled `SecurityRequirementObject[]` and handling
  `security?` as in the plan). Story scope was “inheritance except security edge
  cases,” so this stays a known gap until a dedicated security compile pass
  exists.
- **Operation `security`**: Still not emitted on `OperationObject` at all.
- **Response MIME**: If no `defaults` layer that matches the status supplies
  `mime`, `compileContent` falls back to `application/octet-stream`; nested
  golden tests should set `mime` on matching `defaults` when JSON bodies are
  expected.

## DSL gotcha

- **`scope({ ... })` shape**: Paths and methods sit next to `forAll` at the top
  level of the argument. There is no `routes: { ... }` wrapper in valid DSL;
  that was an easy mistake when writing the first golden test.
