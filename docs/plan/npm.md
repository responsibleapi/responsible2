# NPM Publish Plan

## Goal

- Publish repo as `@responsibleapi/ts`.
- Ship `1.0.0`.
- Expose stable package-root API from [`src/index.ts`](../../src/index.ts).
- Do not publish [`src/examples/`](../../src/examples/).
- Keep compiler scope at OpenAPI `3.1+`. No 3.0.x work.
- Keep `src/dsl` and `src/compiler` as internal folders, not separate packages.

## Current State

- `package.json` has no npm publish fields yet:
  - no scoped package name
  - no `version`
  - no `exports`
  - no build output
- `tsconfig.json` is `noEmit: true`.
- repo needs separate build config for publish emit:
  - current `tsconfig.json` is typecheck-only
  - publish build should not reuse repo-wide `include`
  - full-repo emit currently gets pulled into `src/examples/**`
- [`src/index.ts`](../../src/index.ts) exists and is empty right now.
- Public usage today depends on deep imports from [`src/dsl/`](../../src/dsl/).
- Large real examples live under [`src/examples/`](../../src/examples/) and are
  test fixtures, not library surface.
- Core runtime API already exists:
  - [`responsibleAPI()`](../../src/dsl/dsl.ts) returns final OpenAPI object
  - user only needs JSON or YAML serialization on top

## Product Shape

- One package.
- ESM only.
- Library only.
- No package binary in `1.0.0`.
- No CommonJS build or compatibility wrapper in `1.0.0`.
- No public deep imports into `src/dsl/*`.
- Examples stay repo-only.

Target consumer shape:

```ts
import {
  responsibleAPI,
  scope,
  GET,
  POST,
  object,
  string,
  named,
  queryParam,
  httpSecurity,
} from "@responsibleapi/ts"
```

Runtime shape:

```ts
import { responsibleAPI } from "@responsibleapi/ts"

const api = responsibleAPI({
  // ...
})

console.log(JSON.stringify(api, null, 2))
```

YAML shape for README:

```ts
import { YAML } from "bun"
import { responsibleAPI } from "@responsibleapi/ts"

const api = responsibleAPI({
  // ...
})

console.log(YAML.stringify(api))
```

README decision:

- document both JSON and YAML output paths
- keep JSON example runtime-agnostic with `JSON.stringify`
- keep YAML example Bun-specific via `import { YAML } from "bun"`
- link YAML example to
  [Bun YAML runtime docs](https://bun.com/docs/runtime/yaml)

## Package Positioning

- `@responsibleapi/ts` matches actual product: TypeScript DSL.
- `@responsibleapi/cli` should stay available for future real CLI, if ever
  needed.
- `1.0.0` is good boundary from old 0.x KDL DSL lineage to current TS DSL.

## Package Manifest Plan

### Required changes

- Rename package to `@responsibleapi/ts`.
- Set `version` to `1.0.0`.
- Set `license` to `UNLICENSE`.
- Add publish metadata:
  - `description`
  - `repository`
  - `homepage`
  - `bugs`
  - `keywords`
  - `engines`
- Add publish/build fields:
  - `files`
  - `exports`
  - `types`
  - no `main`
  - root export only; no subpath exports in `1.0.0`
  - root `exports` should expose ESM import + types only
  - `publishConfig.access: "public"`
  - leave `publishConfig.tag` absent for default `latest` flow
  - use CLI `--tag` only for explicit prerelease flows
- Add build scripts for publish artifacts.
- Add `Taskfile.yaml` pipeline for check, build, pack dry-run, and publish
  steps.

### `files` strategy

Use allowlist. Safer than blacklist.

Planned publish content:

- `dist/**`, including emitted `.js`, `.d.ts`, and `.js.map` files
- `README.md`
- `UNLICENSE`
- root `package.json` manifest

Explicitly do not publish:

- `src/examples/**`
- tests
- docs
- scripts not needed at runtime

Reason:

- examples are heavy fixtures
- examples contain large generated specs
- fixtures inflate tarball and blur package surface
- self-contained JS sourcemaps help issue reports and exact-version debugging
  from installed package
- declaration maps are lower-value than runtime sourcemaps in `1.0.0`
- Bun publish dry-runs and tarballs should follow same allowlist

## Task Runner Plan

Add explicit publish pipeline tasks in [`Taskfile.yaml`](../../Taskfile.yaml).

Reason:

- publish flow should be repeatable
- check/build/pack/publish steps should have one canonical entrypoint
- release work should not depend on ad hoc shell commands

Minimum task coverage:

- `check`: run repo validation needed before publish
- `build`: emit publish artifacts into `dist/`
- `pack` or `publish:dry-run`: verify packaged output before release
- `publish:guard`: fail if branch is not `master`, git worktree is dirty, or
  current package version already exists on npm
- `publish`: run real release command

Recommendation:

- keep `reindex` as separate source-indexing task
- add publish pipeline beside existing tasks in
  [`Taskfile.yaml`](../../Taskfile.yaml)
- make Taskfile the canonical human entrypoint
- make README and release notes point at task commands, not raw one-off shell
  sequences
- make `publish` depend on `publish:guard`
- do not auto-increment or rewrite version in Taskfile; publish should fail fast
  on already-published version

Canonical release flow:

- `task check`
- `task build`
- `task publish:dry-run`
- `task publish`

Dependency graph:

- `check -> build -> publish:dry-run -> publish:guard -> publish`

## Registry Config Plan

### Bun config sources

`bun publish` reads both `bunfig.toml` and `.npmrc`.

Plan:

- keep publish command at repo root
- keep package publish metadata in `package.json`
- use user-level `~/.npmrc` for npm registry/auth concerns
- do not add repo-local `.npmrc` for `1.0.0`
- do not add `.npmrc.example` for `1.0.0`
- do not require `bunfig.toml` changes for `1.0.0`

### `~/.npmrc` policy

Use existing user-level `~/.npmrc`. Do not add repo-local npm auth config in
this release.

Recommended shape:

```ini
@responsibleapi:registry=https://registry.npmjs.org/
//registry.npmjs.org/:_authToken=${NPM_CONFIG_TOKEN}
```

Rules:

- prefer environment-backed token via `${NPM_CONFIG_TOKEN}`
- never commit literal npm auth token
- keep auth in user-level machine state, not repo files

Reason:

- Bun supports `.npmrc` directly
- publish auth is sensitive local machine state
- repo should document publish setup without storing secrets

## Build Artifact Plan

### Recommendation

- Emit compiled JS + declarations into `dist/`.
- Emit JS sourcemaps with embedded source text for exact-version debugging.
- Do not emit declaration maps.
- Do not publish raw `src/` as runtime entry.
- Use `tsc` as single publish build tool.

Reason:

- current source imports `.ts` files directly
- npm consumers should not depend on TS-aware resolution in dependency graph
- package needs stable JS entrypoints plus `.d.ts`
- sourcemaps with embedded source text preserve exact-version stacktrace context
  without expanding package entry surface
- declarations should point at emitted surface, not deep source tree

### Output shape

- `dist/index.js`
- `dist/index.js.map`
- `dist/index.d.ts`
- compiled internal JS and declaration files under `dist/**` for modules
  reachable from [`src/index.ts`](../../src/index.ts)
- compiled internal `.js.map` files under `dist/**` for reachable modules
- no `.d.ts.map` files
- public package entry stays root-only even if internal compiled files exist in
  tarball

Package-root meaning:

- consumer import path is `@responsibleapi/ts`
- source package-root barrel is [`src/index.ts`](../../src/index.ts)
- published runtime entry is `dist/index.js`
- published type entry is `dist/index.d.ts`

### Emit plan

Use separate `tsconfig.build.json`. Keep root
[`tsconfig.json`](../../tsconfig.json) as repo-wide typecheck config.

Reason:

- current `tsconfig.json` is intentionally `noEmit: true`
- current source uses `.ts` relative imports
- `allowImportingTsExtensions` only works for typecheck or declaration-only emit
- full-repo declaration emit is wrong package boundary and already trips on
  example-only exports
- publish-time `.d.ts` should follow root package entry, not repo layout

Recommended `tsconfig.build.json` shape:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "sourceMap": true,
    "inlineSources": true,
    "rootDir": "./src",
    "outDir": "./dist",
    "rewriteRelativeImportExtensions": true
  },
  "include": ["src/index.ts"]
}
```

Implications:

- `tsc -p tsconfig.build.json` emits package JS + `.d.ts` + `.js.map`
- only files reachable from [`src/index.ts`](../../src/index.ts) are emitted
- `src/examples/**` stays out of publish output
- sourcemaps carry embedded TS source for exact-version runtime debugging
- declaration maps stay out of tarball
- root `tsconfig.json` stays optimized for editor and `bun check` workflows

### Build tool decision

Decision:

- use `tsc` for publish JS + `.d.ts` emit
- treat `tsc` as default path until concrete build or package problems show up
- do not add separate bundler/transpiler step
- emit ESM only

Reason:

- `tsc` already covers required artifact shape
- extra tool only makes sense after specific pain, not preemptively

Decision:

- do not emit CommonJS
- do not add dual package exports
- do not add `require` condition in `exports`
- first public contract is `import` + `.d.ts` only

## Bun Publish Flow

Publish from repo root after build artifacts exist in `dist/`.

Canonical commands:

```sh
task publish:dry-run
```

First real public release:

```sh
task publish
```

Useful variants:

- underlying publish command is still `bun publish` from repo root
- stable `task publish` should use plain `bun publish` and land on npm `latest`
- `bun publish --tag next` for prerelease channel
- `bun publish --otp 123456` if npm 2FA code should be passed directly
- `bun publish --auth-type legacy` if CLI OTP prompt is preferred over web flow
- `bun publish --tolerate-republish` for CI jobs that may retry same version

Tarball flow if separate pack step is needed:

```sh
bun pm pack
bun publish ./package.tgz
```

Important note:

- lifecycle scripts run only when `bun publish` packs package itself
- lifecycle scripts do not run when publishing prebuilt `.tgz`
- `bun publish` from repo root is underlying publisher for `1.0.0`
- `bun publish dist` only makes sense if `dist/` becomes standalone publish root
- keeping `publishConfig.tag` absent preserves default npm `latest` behavior
- prerelease tags should stay explicit at command level, not baked into manifest

## Execution Model

No package binary needed for `1.0.0`.

Reason:

- [`responsibleAPI()`](../../src/dsl/dsl.ts) already returns final OpenAPI
  object
- single-file authoring is simpler than package-owned execution flow
- stringification is one line in user code
- binary would add loader/runtime/build/versioning surface without adding real
  modeling capability

Recommended user flow:

1. author API in `api.ts`
2. import public DSL from package root `@responsibleapi/ts`
3. call `responsibleAPI(...)` in same file
4. `console.log` or `process.stdout.write` whatever serialization author wants
5. run that file with chosen runner

Example:

```ts
import { responsibleAPI } from "@responsibleapi/ts"

const api = responsibleAPI({
  // ...
})

console.log(JSON.stringify(api, null, 2))
```

## Node Runtime Decision

Node first gained native `.ts` execution in `v22.6.0` via
`--experimental-strip-types`.

Plain `node api.ts` without that flag arrived later in `v23.6.0` and was
backported to `v22.18.0`.

Important limits:

- this is lightweight support, not full TypeScript runtime
- Node ignores `tsconfig.json`
- non-erasable TS syntax may still need extra flags or another runner

Implication for package plan:

- package itself should publish ESM JS + `.d.ts`
- set `engines.node` to `>=22.18.0`
- docs can recommend plain `node api.ts` for user-authored entry files
- package should not rely on shipping a custom wrapper binary

## `src/index.ts` API Plan

### Principle

- Root entry should mirror DSL mental model, not folder layout.
- Re-export public DSL only.
- Root import only in `1.0.0`; no subpath exports.
- Do not export compiler internals.
- Do not export examples.
- Do not force users to know `dsl.ts` vs `schema.ts` vs `params.ts`.

### Root exports

Re-export runtime helpers used across real examples:

- from `dsl.ts`
  - `responsibleAPI`
- from `scope.ts`
  - `scope`
- from `methods.ts`
  - `GET`
  - `HEAD`
  - `POST`
  - `PUT`
  - `DELETE`
- from `nameable.ts`
  - `named`
  - `ref`
- from `operation.ts`
  - `resp`
- from `params.ts`
  - `queryParam`
  - `pathParam`
  - `headerParam`
- from `response-headers.ts`
  - `responseHeader`
- from `security.ts`
  - `querySecurity`
  - `headerSecurity`
  - `httpSecurity`
  - `oauth2Security`
  - `oauth2Requirement`
  - `securityAND`
  - `securityOR`
- from `tags.ts`
  - `declareTags`
- from `schema.ts`
  - `allOf`
  - `anyOf`
  - `array`
  - `boolean`
  - `dict`
  - `double`
  - `email`
  - `float`
  - `httpURL`
  - `int32`
  - `int64`
  - `integer`
  - `nullable`
  - `number`
  - `object`
  - `oneOf`
  - `string`
  - `uint32`
  - `uint64`
  - `unixMillis`
  - `unknown`

### Root type exports

Re-export public types that appear in examples or are natural extension points:

- from `params.ts`
  - `InlinePathParam`
  - `InlineQueryParam`
  - `InlineHeaderParam`
- from `schema.ts`
  - `Schema`

### Export style

- Prefer explicit export list in `src/index.ts`.
- Do not use `export *` from every module.

Exact root `package.json` `exports` object:

```json
{
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.js",
    "default": "./dist/index.js"
  }
}
```

Keep top-level `"types": "./dist/index.d.ts"` too. Do not export
`./package.json`.

Reason:

- public surface stays intentional
- root-only import path stays easy to teach and document
- avoids freezing multiple package entrypoints in first release
- avoids leaking test-only or helper-only additions by accident
- makes semver review easier for future releases

## API Design Notes From Examples

Examples indicate root API must support these usage patterns:

- full-doc compilation via `responsibleAPI(...)`
- nested route composition via `scope(...)`
- method helpers for single operations
- schema builders for object, arrays, unions, numeric/string formats
- reusable component refs via `named(...)` and `ref(...)`
- inline and reusable params
- reusable response headers
- document, operation, and scope security helpers
- tag registry via `declareTags(...)`

Examples do not justify exporting:

- compiler internals from `src/compiler/`
- test fixtures
- repo scripts
- `src/help/*`

## Package Boundary Plan

Do not split `src/dsl` and `src/compiler` into separate npm packages now.

Reason:

- current boundary is implementation boundary, not stable package contract
- compiler still knows DSL-specific normalization details
- split would add semver and build complexity before public API stabilizes

Plan:

- publish one package: `@responsibleapi/ts`
- keep `src/dsl` and `src/compiler` private behind root exports
- expose root package entry only in `1.0.0`
- revisit split only if real demand appears for alternate frontends or
  compiler-only consumption

## Publish Safety Checks

Before first publish:

1. Run Taskfile check task.
2. Run Taskfile build task.
3. Run Taskfile pack dry-run or publish dry-run task.
4. Inspect Bun publish summary for packed files, tag, access, registry.
5. Optionally run `bun pm pack` and inspect tarball contents directly.
6. Confirm `src/examples/**` absent from tarball.
7. Confirm root import works from packed tarball.
8. Confirm `.d.ts` points only at public root exports.
9. Confirm packed `package.json` exposes only ESM root export and no CommonJS
   fallback.
10. Confirm README install/import snippets use `@responsibleapi/ts`.
11. Confirm publish auth comes from env or user-level `~/.npmrc`, not committed
    repo file.

Taskfile publish guardrails:

- fail `task publish` if current branch is not `master`
- fail `task publish` if `git status --short` is non-empty
- fail `task publish` if current `package.json` version already exists on npm
- never auto-bump version in Taskfile

## Suggested Execution Order

1. Lock remaining packed manifest details:
   - exact `types` path
   - exact `files` allowlist entries for sourcemaps
2. Add build pipeline and package manifest fields.
3. Add Taskfile pipeline in [`Taskfile.yaml`](../../Taskfile.yaml) for check,
   build, pack dry-run, and publish. Add publish guardrails for branch, dirty
   git state, and already-published version.
4. Add `~/.npmrc` guidance for publish auth.
5. Implement [`src/index.ts`](../../src/index.ts) explicit export barrel.
6. Update README for install/import/JSON+YAML serialization usage and Node
   `22.18.0+` guidance.
7. Run `task publish:dry-run`.
8. Publish `1.0.0` with `task publish`.

## Node Version Recommendation

- Package minimum Node version is `>=22.18.0`.
- Reason:
  - first native `.ts` support landed in `22.6.0`, but only behind
    `--experimental-strip-types`
  - no-flag execution arrived in `23.6.0` and was backported to `22.18.0`
  - simple docs should not depend on experimental CLI flags
- README can recommend plain `node api.ts`.

## README Example Decision

- Document both JSON and YAML examples in README.
- Use `JSON.stringify` for default runtime-neutral output example.
- Use Bun YAML runtime API for YAML example.
- Link YAML example to
  [Bun YAML runtime docs](https://bun.com/docs/runtime/yaml).

## Recommendation

- Publish single ESM package `@responsibleapi/ts@1.0.0`.
- Ship explicit root barrel in [`src/index.ts`](../../src/index.ts).
- Keep examples out of tarball via `files` allowlist and build entry selection.
- Enforce root-only imports in `1.0.0`; no subpath exports.
- Put canonical release pipeline in [`Taskfile.yaml`](../../Taskfile.yaml).
- Use `tsc` for publish JS + `.d.ts` emit for now; revisit only if concrete
  publish/build problems show up.
- Use `task` commands as canonical human publish path.
- Keep npm auth in user-level `~/.npmrc` or environment, never committed repo
  file.
- Keep library package binary-free.
- Document both JSON and YAML serialization in README; use Bun YAML runtime docs
  for YAML path.
- Set minimum Node version to `22.18.0+`.
- Treat root export list as semver contract from first publish.
- Set root `exports` to ESM-only `.` entry with `types`, `import`, and `default`
  pointing at `dist/index`.
- Keep top-level `types` field and omit `./package.json` export.
- Leave `publishConfig.tag` absent so default stable publish lands on npm
  `latest`.
- Put release guardrails in [`Taskfile.yaml`](../../Taskfile.yaml): `publish`
  must fail on non-`master`, dirty git state, or already-published version.

## Resolved Dist-Tag Decision

- Keep `publishConfig.tag` absent.
- `task publish` targets stable npm `latest`.
- Any prerelease channel stays explicit via CLI tag such as
  `bun publish --tag next`.
