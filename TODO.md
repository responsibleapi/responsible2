# TODO

- [`buildResponseContent`](src/compiler/index.ts) in the compiler carries
  awkward special-casing around empty inline JSON schemas (201 vs other 2xx,
  exceptions golden vs omitting content) that exists largely so
  [`src/examples/listenbox.test.ts`](src/examples/listenbox.test.ts) passes.
  Revisit and fix properly instead of encoding golden quirks in the compiler.
