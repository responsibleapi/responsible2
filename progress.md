# Progress

## TODO

- introduce a `duration` DSL helper for RFC 3339 / ISO 8601 duration strings
  - should emit a string schema with `format: "duration"`
  - useful for recurring billing periods like `P1W`, `P1M`, and `P1Y`
- rename req.params to req.reusableparams, because it's not clear why we're
  defining an inline query param in `query` but some other random named param in
  `params`
- we have "legacy" stuff already in `src/compiler/`. wtf
- SKILL.md

## Someday

https://www.openapis.org/blog/2025/09/23/announcing-openapi-v3-2
