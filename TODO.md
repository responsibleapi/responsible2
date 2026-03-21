- The schema DSL hardcodes too few formats. [schema.ts](src/dsl/schema.ts#L3)
  only permits string formats `email|uri|uuid|date|date-time|binary|url|blob`,
  and [schema.ts](src/dsl/schema.ts#L33) only permits integer formats
  `int32|int64`. The YouTube schema needs at least `byte`, `uint32`, and
  `uint64`, e.g. [youtube.json](src/examples/youtube.json#L10357),
  [youtube.json](src/examples/youtube.json#L11679), and
  [youtube.json](src/examples/youtube.json#L13076).

Because of those gaps, bringing [youtube.ts](src/examples/youtube.ts) fully up
to date would require DSL work first. If you want, I can implement those DSL
additions next.
