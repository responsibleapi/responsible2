import { describe, test } from "vitest"
import type { Assert, IsSubtypeOf, IsNever } from "../type-assertions.ts"
import type { scope } from "./scope.ts"

type Op = {
  res: {
    200: Record<string, never>
  }
}

type PureScope = {
  GET: Op
  POST: Op
}

type SingleMethodPureScope = {
  GET: Op
}

type WrappedPureScope = {
  routes: PureScope
}

type WrappedSingleMethodPureScope = {
  routes: SingleMethodPureScope
}

type ScopeArg<T extends (...args: never[]) => unknown> = Parameters<T>[0]

describe("scope", () => {
  test("accepts a pure scope with at least two methods", () => {
    type _Test = Assert<
      IsSubtypeOf<PureScope, ScopeArg<typeof scope<PureScope>>>
    >
  })

  test("rejects a pure scope with only one method", () => {
    type _Test = Assert<IsNever<ScopeArg<typeof scope<SingleMethodPureScope>>>>
  })

  test("accepts a wrapped pure scope with at least two methods", () => {
    type _Test = Assert<
      IsSubtypeOf<WrappedPureScope, ScopeArg<typeof scope<WrappedPureScope>>>
    >
  })

  test("rejects wrapped routes with only one method", () => {
    type _Test = Assert<
      IsNever<ScopeArg<typeof scope<WrappedSingleMethodPureScope>>["routes"]>
    >
  })
})
