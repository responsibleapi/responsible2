import { describe, test } from "vitest"
import type { Assert, IsEqual, IsNever, OneExtendsTwo } from "../type-assertions.ts"
import type { ScopeOpts } from "./scope.ts"
import { scope } from "./scope.ts"
import { declareTags } from "./tags.ts"

type TestOp = {
  res: {
    200: Record<string, never>
  }
}

type PureScope = {
  GET: TestOp
  POST: TestOp
}

type SingleMethodPureScope = {
  GET: TestOp
}

type PureScopeWithDefaults = {
  forAll: ScopeOpts
  GET: TestOp
  POST: TestOp
}

type SingleMethodPureScopeWithDefaults = {
  forAll: ScopeOpts
  GET: TestOp
}

type ScopeArg<T extends (...args: never[]) => unknown> = Parameters<T>[0]

describe("scope", () => {
  test("accepts a pure scope with at least two methods", () => {
    type _Test = Assert<
      OneExtendsTwo<PureScope, ScopeArg<typeof scope<PureScope>>>
    >
  })

  test("rejects a pure scope with only one method", () => {
    type _Test = Assert<IsNever<ScopeArg<typeof scope<SingleMethodPureScope>>>>
  })

  test("accepts a flat scope with defaults and at least two methods", () => {
    type _Test = Assert<
      OneExtendsTwo<
        PureScopeWithDefaults,
        ScopeArg<typeof scope<PureScopeWithDefaults>>
      >
    >
  })

  test("rejects a flat scope with defaults and only one method", () => {
    type _Test = Assert<
      IsNever<
        ScopeArg<typeof scope<SingleMethodPureScopeWithDefaults>>
      >
    >
  })

  test("accepts declared tags in scope defaults", () => {
    const tags = declareTags({
      videos: {},
      channels: {},
    } as const)

    type _Test = Assert<
      IsEqual<
        NonNullable<ScopeOpts<typeof tags>["tags"]>,
        readonly (typeof tags.videos | typeof tags.channels)[]
      >
    >
  })

  test("rejects inline tag objects in scope defaults", () => {
    const tags = declareTags({
      videos: {},
    } as const)

    type _Test = Assert<
      IsNever<
        Extract<
          { readonly name: "videos" },
          NonNullable<ScopeOpts<typeof tags>["tags"]>[number]
        >
      >
    >
  })
})
