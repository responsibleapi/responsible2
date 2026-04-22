# Taskfile Dependency Graph

```mermaid
flowchart TD
  codex["codex"]
  cursor["cursor"]
  reindex["reindex"]
  check["check"]
  build["build"]
  publishDryRun["publish:dry-run"]
  publishAuth["publish:auth"]
  publishGuard["publish:guard"]
  publish["publish"]

  check --> build
  build -> publish
  publishAuth --> publish
  publishGuard --> publish
  build -> publishDryRun
```
