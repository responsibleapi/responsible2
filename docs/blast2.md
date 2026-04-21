# Blast Radius With MCP

## Goal

Compare two agent-callable surfaces for blast-radius work:

- `Sourcegraph` MCP
- `code-review-graph` MCP

Also answer one deployment question:

- is `Sourcegraph` local-first in same sense as `code-review-graph`?

## Short Answer

- `Sourcegraph` MCP is stronger at general code intelligence primitives.
- `code-review-graph` MCP is stronger at first-class blast-radius workflows.
- `Sourcegraph` can be self-hosted and can keep code/analysis local.
- `Sourcegraph` is not local-first in the same lightweight repo-local sense as
  `code-review-graph`.

Why:

- `Sourcegraph` exposes search, navigation, diff/history, and Deep Search.
- `code-review-graph` exposes explicit impact-analysis tools on top of its
  graph.
- `Sourcegraph` docs do not show first-class MCP tools for impact radius,
  affected tests, architectural chokepoints, or risk-scored changed-file
  fallout.
- `Sourcegraph` can synthesize some of that through `deepsearch` plus lower
  level tools, but that is agent-composed analysis, not dedicated impact API.

## `Sourcegraph` MCP Surface

Official MCP docs show these tool groups:

- file and repo operations:
  - `read_file`
  - `list_files`
  - `list_repos`
- code search:
  - `keyword_search`
  - `nls_search`
- code navigation:
  - `go_to_definition`
  - `find_references`
- version control and history:
  - `commit_search`
  - `diff_search`
  - `compare_revisions`
  - `get_contributor_repos`
- agentic analysis:
  - `deepsearch`
  - `deepsearch_read`

That is strong substrate for:

- exact or near-exact symbol lookup
- cross-repo references
- file and repo exploration
- commit and diff inspection
- natural-language investigation over codebases

Important MCP detail:

- default endpoint `/.api/mcp` is now curated
- full suite lives at `/.api/mcp/all`

So even code navigation tools are not always on default endpoint.

Sources:

- https://sourcegraph.com/docs/api/mcp
- https://sourcegraph.com/changelog/mcp-curated-default-tools

## `code-review-graph` MCP Surface

Official docs and README show explicit graph-analysis tools, including:

- graph lifecycle:
  - `build_or_update_graph_tool`
  - `list_graph_stats_tool`
- blast radius and review context:
  - `get_impact_radius_tool`
  - `detect_changes_tool`
  - `get_review_context_tool`
  - `get_minimal_context_tool`
- dependency and test queries:
  - `query_graph_tool`
  - `traverse_graph_tool`
- architecture and structural risk:
  - `get_affected_flows_tool`
  - `list_flows_tool`
  - `get_flow_tool`
  - `list_communities_tool`
  - `get_community_tool`
  - `get_architecture_overview_tool`
  - `get_hub_nodes_tool`
  - `get_bridge_nodes_tool`
  - `get_knowledge_gaps_tool`
  - `get_surprising_connections_tool`
  - `get_suggested_questions_tool`
- refactor support:
  - `refactor_tool`
  - `apply_refactor_tool`

That surface is directly shaped for questions like:

- what files and functions sit in blast radius of this change?
- what flows are affected?
- where are chokepoints?
- which tests or test gaps are nearby?
- what structural risks should review prioritize?

Source:

- https://github.com/tirth8205/code-review-graph

## Where `Sourcegraph` Is Stronger

`Sourcegraph` wins on general code-intelligence substrate:

- compiler-backed precise code navigation when SCIP is available
- cross-repository navigation as a first-class product capability
- strong search over repos, revisions, commits, and diffs
- hosted or self-hosted platform model
- first-class MCP server with OAuth and access-token support
- Deep Search for agentic research across codebases

This makes `Sourcegraph` better for:

- exact references and definitions
- large multi-repo discovery
- history-aware exploration
- agent research over unfamiliar repos

Sources:

- https://sourcegraph.com/docs/code-navigation
- https://sourcegraph.com/docs/code-navigation/precise-code-navigation
- https://sourcegraph.com/docs/api/mcp

## Where `code-review-graph` Is Stronger

`code-review-graph` wins on blast-radius specialization.

It has first-class tools for:

- impact radius
- changed-file fallout
- affected flows
- hubs and bridge nodes
- knowledge gaps
- architecture overview

Those are not just raw primitives. They are pre-shaped answers for review and
impact analysis.

So for an agent, one question like:

- "what else is likely to break if I change this?"

maps more directly onto `code-review-graph` than onto `Sourcegraph`.

With `Sourcegraph`, the agent usually has to compose:

- `find_references`
- `compare_revisions`
- `diff_search`
- `read_file`
- `deepsearch`

That can work well, but it is composition, not dedicated blast-radius API.

Source:

- https://github.com/tirth8205/code-review-graph

## First-Class Blast-Radius Gap In `Sourcegraph` MCP

As of April 21, 2026, I did not find official `Sourcegraph` MCP tools for:

- impact radius
- affected tests
- architectural chokepoints
- risk-scored changed-file fallout

What `Sourcegraph` does provide:

- lower-level search and navigation tools
- `deepsearch` for natural-language investigation

Inference:

- `Sourcegraph` can answer some blast-radius questions through agent reasoning
  over its tool stack
- `Sourcegraph` does not currently document those answers as first-class MCP
  tool contracts

Sources:

- https://sourcegraph.com/docs/api/mcp
- https://sourcegraph.com/docs/code-search/types/deep-search

## Is `Sourcegraph` Local-First?

Short answer:

- local-capable and self-hostable: yes
- repo-local lightweight local-first: no

What supports "yes":

- `Sourcegraph` has enterprise self-hosted deployment docs
- docs explicitly say you can deploy it inside your organization on internal
  code
- docs say that when connected to a code host, code is not sent off your local
  Sourcegraph deployment and analysis/indexing happen locally
- docs also support serving local repos with `src serve-git`

What supports "no":

- product model is platform/server oriented, not single-repo local by default
- docs explicitly say it is easier to connect Sourcegraph to a code host than to
  load code from local disk, and strongly encourage code-host connection
- editor integrations are built around searching repos without checking them out
  locally

So `Sourcegraph` is better described as:

- self-hosted / on-prem / keep-your-code-local

not as:

- local-first per-repo tool

That differs from `code-review-graph`, which is designed around a local graph
stored in `.code-review-graph/` inside or alongside the repo and queried
directly by local agents.

Sources:

- https://sourcegraph.com/docs/getting-started
- https://sourcegraph.com/docs/admin/self-hosted
- https://sourcegraph.com/docs/admin/code-hosts/src-serve-git
- https://sourcegraph.com/docs/integration/editor
- https://github.com/tirth8205/code-review-graph

## Recommendation

If your main question is:

- "give my agent exact code search, references, diffs, and repo exploration"

prefer `Sourcegraph`.

If your main question is:

- "give my agent a direct blast-radius and review-impact surface"

prefer `code-review-graph`.

If you want best combined outcome:

- use `Sourcegraph` for precision, breadth, and freshness
- use `code-review-graph` for synthesized blast-radius answers

That is not contradiction.

- `Sourcegraph` is stronger general platform
- `code-review-graph` is stronger blast-radius-specialized MCP surface
