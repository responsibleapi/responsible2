## High-value changes with the existing DSL

## Optional `dsl.ts` change

5. Keep `src/dsl/dsl.ts` as-is unless you want a root API shape that matches
   `scope`. `responsibleAPI` still has a special root-only shape
   (`src/dsl/dsl.ts:24`) instead of the flat `forAll + routes` style that
   `scope` uses. Letting the root accept a `Scope`-like object, or a
   `root: Scope`, would make very large examples feel less special-cased. It is
   ergonomic only; the cleanup above does not require it.
