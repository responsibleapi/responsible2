# Blast Radius

## Goal

Compare `code-review-graph` against Go-native tooling for one question:

- if I change this symbol, file, or package, what else is likely to break?

This is not just "find references". Real blast radius usually means:

- direct callers
- transitive callers/callees
- package boundaries
- test coverage around affected code
- git-diff impact
- risky hubs or chokepoints
- architectural coupling

## Short Answer

- `code-review-graph` is stronger at repo-level blast radius.
- Go tooling is stronger at always-fresh semantic facts.
- Go tooling does not need a reindex step.
- `code-review-graph` gives higher-level answers, but only after building and
  refreshing its graph.

That reindex cost is explicit in this repo:

- [Taskfile.yaml](/Users/adelnizamutdinov/Projects/responsibleapi/Taskfile.yaml:7)
  runs `code-review-graph build`
- [AGENTS.md](/Users/adelnizamutdinov/Projects/responsibleapi/AGENTS.md:28)
  requires `task reindex` before edits under `src/**/*`

Go tooling has no equivalent manual graph build step. `go doc`, `go list`,
`go test`, `go vet`, and `gopls` work from current source state.

## What `code-review-graph` Adds

`code-review-graph` is not just a symbol index. It builds a persistent
repository graph and then answers review-oriented questions on top.

Useful blast-radius features:

- repo-wide nodes and edges across files, functions, tests, and imports
- architectural communities
- bridge nodes and hubs
- affected execution flows
- test-gap analysis
- git-diff-aware review context
- structural questions like "what is surprisingly coupled?"

In practice this means it can answer:

- what changed
- what that change touches beyond direct references
- which tests appear to cover touched code
- which hot paths or chokepoints sit nearby

That is closer to "review impact analysis" than classic language tooling.

## What Go Tooling Gives

### `go doc`

Good at:

- package docs
- symbol docs
- exported API shape
- source lookup with `-src`

Weak at:

- references
- callers/callees
- cross-package impact
- diff-aware review
- risk scoring

`go doc` is documentation lookup, not blast-radius analysis.

### `go list`

Good at:

- package inventory
- module metadata
- file lists
- import lists
- recursive dependency lists
- test package metadata

This is valuable substrate for custom analysis, but output is still package
centric. It does not directly answer:

- which functions call this function
- which tests cover this symbol
- which package is a chokepoint

### `gopls`

`gopls` is closest Go-native match for local semantic impact analysis.

Good at:

- definition
- references
- implementation
- workspace symbols
- call hierarchy
- rename safety checks
- diagnostics and code actions

This covers much of day-to-day developer navigation:

- who uses this symbol
- where does this method come from
- what calls this function
- can I rename this safely

But stock `gopls` still stops short of repo-level blast-radius summaries. It
does not natively produce:

- git-diff impact reports
- architectural communities
- bridge or hub ranking
- test-gap reports tied to changed symbols
- cross-language coupling
- persistent review context for AI/code review workflows

## Freshness vs Depth

This is main tradeoff.

### Go tooling

- always computed from current code
- no explicit reindex
- editor-integrated
- reliable for symbol facts

But:

- mostly local and semantic
- weaker at summarizing system-level impact

### `code-review-graph`

- stronger at synthesized impact views
- stronger at review/debug/refactor workflows
- stronger at repository structure

But:

- needs graph build/update
- can go stale after edits
- quality depends on extractor coverage and postprocessing

So Go tooling wins on freshness. `code-review-graph` wins on derived insight.

## Poor Man's Blast Radius For Go

If restricted to Go-native tooling, closest approximation is layered, not
single-tool.

### Layer 1: package boundary

Use `go list` to see immediate and transitive package relationships.

Examples:

```sh
go list ./...
go list -json .
go list -deps -json ./...
go list -f '{{.ImportPath}} {{join .Imports " "}}' ./...
```

This gives:

- package inventory
- imports
- dependency closure
- test package metadata

### Layer 2: symbol boundary

Use `gopls` in editor for:

- references
- incoming/outgoing calls
- rename preview
- implementation graph

This gives symbol-level blast radius for one identifier, but mostly through
interactive editor queries.

### Layer 3: source grep

Use fast text search for non-typechecked surfaces:

```sh
rg -n 'Executor\.RunTask|RunTask\('
rg -n 'package task'
rg -n 'NewExecutor'
```

This catches:

- comments
- strings
- generated code
- templates
- shell/YAML references

`gopls` usually should lead. `rg` fills gaps.

### Layer 4: tests

Use test runs as dynamic blast-radius check:

```sh
go test ./...
go test ./path/to/pkg
go test -run TestName ./path/to/pkg
go test -json ./...
```

This does not prove coverage of a symbol, but it tells you which packages fail
after a change.

### Layer 5: vet and analysis

```sh
go vet ./...
```

Add other analyzers if allowed in repo. This improves "what did I break?"
signal, but still does not produce structural blast radius.

### Layer 6: custom glue

If you want real blast radius from Go tooling alone, you usually end up writing
custom tooling around:

- `go/packages`
- `go/types`
- SSA
- call graph packages
- coverage data
- `git diff`

At that point you are rebuilding a narrower Go-only version of what
`code-review-graph` already aims to provide across a repo.

## Practical Comparison

For a Go-only repo:

- `go doc` replaces almost none of `code-review-graph`
- `go list` replaces some low-level metadata gathering
- `gopls` replaces much of symbol navigation and safe rename work
- `go test` replaces none of the structure analysis, but validates fallout

Reasonable estimate:

- Go tooling covers much of local semantic navigation
- `code-review-graph` covers more of review-oriented system impact

So if question is:

- "where is this symbol used?" use `gopls`
- "what packages import this?" use `go list`
- "did change break tests?" use `go test`
- "what is blast radius across repo structure and tests?" use
  `code-review-graph`

## Recommendation

For Go-only work, best stack is hybrid:

- `gopls` for live semantic navigation and refactors
- `go list` for package/module facts
- `go test` and `go vet` for fallout detection
- `code-review-graph` when you need structural blast radius, review context, or
  architecture-aware analysis

If forced to choose one:

- choose Go tooling for everyday coding
- choose `code-review-graph` for impact analysis and review workflows

Those are different jobs. They overlap, but they are not substitutes.
