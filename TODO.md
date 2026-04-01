# TODO

- [`buildResponseContent`](src/compiler/index.ts) in the compiler carries
  awkward special-casing around empty inline JSON schemas (201 vs other 2xx,
  exceptions golden vs omitting content) that exists largely so
  [`src/examples/listenbox.test.ts`](src/examples/listenbox.test.ts) passes.

  copy simple behavior from old compiler
  `/Users/adelnizamutdinov/responsible/responsible/packages/generator/src/`

  DO NOT edit `src/examples/listenbox.ts`

  do not worry about other `src/examples/` right now
