# Code Review Graph Plan

## Goal

- Incorporate
  [`tirth8205/code-review-graph`](https://github.com/tirth8205/code-review-graph)
  into local Codex workflow for `responsibleapi`.
- Reduce repeated full-repo reads during compiler and DSL work.
- Build solid graph coverage for `src/examples/`, including `*.json` and
  `*.yaml`, if upstream supports indexing them.
- Keep repo source unchanged except for this plan doc.

## Why This Fits This Repo

- `responsibleapi` is a small-to-medium TypeScript codebase with dense internal
  coupling between `src/dsl/`, `src/compiler/`, and tests.
- Typical work here is not one-file CRUD editing. It is compiler behavior,
  inheritance rules, schema emission, and regression coverage.
- `code-review-graph` is built for this shape of work: it builds a structural
  graph, tracks changes incrementally, and gives the agent blast-radius context
  instead of making it reread whole files on each task.
- Upstream claims:
  - `install --platform codex` configures Codex directly
  - initial build is about 10 seconds for a 500-file repo
  - subsequent updates happen on file edit and git commit
  - average token reduction is `8.2x`, with larger wins on multi-file tasks

## Repo-Specific Constraints

- Keep existing [`AGENTS.md`](../../AGENTS.md) authoritative.
- Do not edit `package.json` or `bunfig.toml` for this integration.
- For compiler and DSL tasks not rooted in examples, do not start from generated
  example artifacts by default:
  - `src/examples/*.json`
  - large example fixtures
- If `code-review-graph` supports JSON/YAML indexing, treat
  `src/examples/*.{json,yaml,yml}` as first-class graph nodes when the task
  starts from an example, fixture drift, or source-spec parity problem.
- Prefer graph-guided reads for:
  - `src/compiler/`
  - `src/dsl/`
  - `src/examples/`
  - matching `*.test.ts`
  - `README.md`
  - `compiler.md`

## Adoption Plan

### 1. Install Tool Outside Repo

- Install `code-review-graph` as a user-level tool, not a repo dependency.
- Upstream quick start:

```sh
pipx install code-review-graph
```

- Alternative from upstream:

```sh
pip install code-review-graph
```

- If `uv` is already installed, upstream says generated MCP config will prefer
  `uvx` automatically.

### 2. Configure Codex Only

- Run upstream installer in this repo:

```sh
code-review-graph install --platform codex
```

- Reason:
  - keep rollout scoped to Codex
  - avoid touching other editors unless needed later
  - reduce chance of conflicting rule injection elsewhere

### 3. Build Initial Graph

- In repo root, run:

```sh
code-review-graph build
```

- Do this once after install.
- Rebuild manually after any large refactor if incremental state looks stale.

### 3a. Verify Example Artifact Coverage

- Check whether upstream graph build includes:
  - `src/examples/*.json`
  - `src/examples/*.{yaml,yml}`
- If supported, keep those files indexed in the same graph as:
  - sibling `src/examples/*.ts`
  - sibling `src/examples/*.test.ts`
  - compiler and DSL files they exercise
- Desired example edges:
  - JSON fixture -> example test -> example TypeScript -> compiler/DSL code
  - YAML source spec -> example TypeScript -> example test -> compiler/DSL code
- If upstream cannot index JSON/YAML directly, document that limitation in local
  Codex usage notes and fall back to graphing the adjacent `*.ts` and `*.test.ts`
  files only.

### 4. Restart Codex Session

- Upstream install flow says to restart editor/tool after installing.
- After restart, first prompt in repo should be:

```text
Build the code review graph for this project.
```

## Expected Workflow In This Repo

### Session Start

- Ask graph-aware Codex to build or refresh graph first.
- Then ask for minimal context on concrete task:
  - compiler bug in `src/compiler/request.ts`
  - DSL inheritance behavior around `forAll`
  - impact of changing reusable params or schema emission
  - example drift in `src/examples/readme.json`
  - source-spec parity in `src/examples/pachca.yaml`

### During Compiler Work

- Start from changed file.
- Use graph output to identify:
  - callers
  - affected tests
  - dependent compiler stages
  - likely blast radius in `src/dsl/`, `src/examples/*.test.ts`, and related
    example fixtures when indexed
- Read only impacted files before editing.

### During Example Work

- If task starts in `src/examples/`, start from exact artifact named in task:
  - `*.ts`
  - `*.test.ts`
  - `*.json`
  - `*.yaml` or `*.yml`
- Use graph output to walk outward to:
  - paired example source file
  - paired example test
  - compiler and DSL code on path to emitted document
- Keep JSON and YAML files in graph-backed routing path when upstream supports
  them, rather than treating them as opaque blobs to skip.

### During Review Work

- Use graph context first for multi-file changes and refactors.
- Fall back to direct file reads for tiny single-file edits.
- Upstream benchmark notes small single-file changes can cost more than naive
  reads because graph metadata adds overhead.

## Guardrails

- Treat graph results as routing aid, not source of truth.
- When graph says a file is impacted, still inspect real code before editing.
- If graph misses repo conventions from [`AGENTS.md`](../../AGENTS.md), follow
  repo instructions, not generated tool guidance.
- If tool injects generic platform rules, keep them subordinate to repo-local
  rules.

## Validation

- Successful incorporation means:
  - Codex can access `code-review-graph` through MCP
  - initial graph build succeeds from repo root
  - Codex starts tasks from graph context instead of broad `rg` + full-file
    sweeps
  - multi-file compiler tasks read fewer unrelated example artifacts
  - example-driven tasks can start from `src/examples/*.json` or
    `src/examples/*.{yaml,yml}` and still surface correct adjacent `*.ts`,
    `*.test.ts`, and compiler/DSL files when upstream supports those formats
- First realistic smoke test:
  - change one compiler file
  - ask Codex for blast radius
  - confirm returned set includes relevant tests and nearby DSL/compiler files
- Second realistic smoke test, conditional on JSON/YAML support:
  - start from `src/examples/readme.json`
  - ask Codex for blast radius and owning source/test files
  - confirm returned set includes `src/examples/readme.ts`,
    `src/examples/readme.test.ts`, and relevant compiler helpers
- Third realistic smoke test, conditional on YAML support:
  - start from `src/examples/pachca.yaml`
  - ask Codex for parity-impact path
  - confirm returned set includes `src/examples/pachca.ts`,
    `src/examples/pachca.test.ts` if present, and relevant compiler/DSL files

## Rollback

- If graph context is noisy or wrong for this repo, remove Codex-side
  integration with the same platform-specific config path the installer wrote.
- Keep repo clean:
  - no committed tool-generated platform files unless explicitly reviewed
  - no package-level dependency changes

## Recommendation

- Adopt `code-review-graph` for Codex sessions that touch:
  - `src/compiler/`
  - `src/dsl/`
  - `src/examples/` source, fixture, and parity work
  - broad refactors
  - review of multi-file behavior changes
- Skip graph-first workflow for tiny edits in isolated files.

## Sources

- [tirth8205/code-review-graph](https://github.com/tirth8205/code-review-graph)
- [responsibleapi AGENTS.md](../../AGENTS.md)
