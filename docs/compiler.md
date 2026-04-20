# Compiler Notes

## Current `params` bug

There is a current compiler bug / limitation around request parameters declared
through `req.params`.

### Scope

Affected path:

- reusable raw params in `req.params`
- especially when wrapper-level metadata such as `example` matters
- especially when that `example` is not a string, for example `10`, `334`, or
  `true`

Unaffected path:

- inline `query`
- inline `pathParams`
- inline `headers`

### Symptom

`req.params` is supposed to be the reusable-parameter path, but today it is not
fully symmetric with inline param maps.

In practice this means a raw reusable param can compile differently from the
equivalent inline `query` / `pathParams` entry, even when both describe the same
OpenAPI parameter.

The most visible failure mode is parameter-wrapper metadata not surviving as
expected. The `pachca` fixture exposed this with inline JSON expecting values
such as:

- path param `example: 334`
- query param `example: 10`
- query param `example: true`

### Why this happens

The compiler handles the two shapes differently:

- `req.params` flows through reusable parameter compilation in
  [src/compiler/request.ts](../src/compiler/request.ts)
- inline maps flow through dedicated map-parameter compilation in
  [src/compiler/request.ts](../src/compiler/request.ts)

The reusable parameter DSL also currently types `example` too narrowly:

- [src/dsl/params.ts](../src/dsl/params.ts)

`ReusedParamBase` currently uses `example?: string`, while inline map params use
`example?: unknown`.

That mismatch makes `req.params` weaker than inline param maps for legitimate
OpenAPI parameter examples.

### Current workaround

If you need inline output and want wrapper metadata to survive exactly, do not
route the parameter through `req.params`.

Instead:

1. Keep the parameter as a plain `const` raw value.
2. Reuse that value from `query` or `pathParams`.
3. Do not wrap it as a named thunk.

Good:

```ts
const QueryLimit = {
  description: "Количество возвращаемых результатов за один запрос",
  example: 10,
  explode: false,
  schema: int32({
    examples: [10],
    default: 200,
    maximum: 200,
  }),
}

const PathId = {
  description: "Идентификатор чата",
  example: 334,
  schema: int32({
    examples: [334],
  }),
}

req: {
  pathParams: {
    id: PathId,
  },
  query: {
    "limit?": QueryLimit,
  },
}
```

Avoid for this case:

```ts
const QueryLimit = queryParam({
  name: "limit",
  description: "Количество возвращаемых результатов за один запрос",
  example: 10,
  explode: false,
  schema: int32({
    examples: [10],
    default: 200,
    maximum: 200,
  }),
})

req: {
  params: [QueryLimit],
}
```

### Status

This is documentation of current behavior, not a design goal.

Until the compiler paths are unified, prefer:

- `req.params` for cases where reusable parameter mechanics are sufficient
- inline `query` / `pathParams` when exact inline OpenAPI shape matters
