# NPM

## TODO

- make the npm package usable as `@responsibleapi/ts` from downstream projects
  like `/Users/adelnizamutdinov/Projects/recurring/packages/openapi`
  - `package.json` currently declares `types: "./dist/index.d.ts"` and exports
    `./dist/index.js`, but the installed `@responsibleapi/ts@1.0.0` package did
    not include `dist/`
  - `bunx tsc --noEmit -p packages/openapi/tsconfig.json` in `recurring`
    failed with `Cannot find module '@responsibleapi/ts' or its corresponding
    type declarations`
  - publish a fixed version that includes built `dist/**`, or change exports to
    files that are actually published
  - verify from a fresh downstream install that `import { responsibleAPI } from
    "@responsibleapi/ts"` resolves without `paths` hacks
  - consider adding a publish guard that packs to a temp dir and type-checks a
    tiny consumer project against the packed tarball
