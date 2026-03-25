import { describe, expect, test } from "vitest"
import type {
  Assert,
  IsEqual,
  IsNever,
  OneExtendsTwo,
} from "../type-assertions.ts"
import { opTags, scope, tag, type Op } from "./scope.ts"

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
      OneExtendsTwo<PureScope, ScopeArg<typeof scope<PureScope>>>
    >
  })

  test("rejects a pure scope with only one method", () => {
    type _Test = Assert<IsNever<ScopeArg<typeof scope<SingleMethodPureScope>>>>
  })

  test("accepts a wrapped pure scope with at least two methods", () => {
    type _Test = Assert<
      OneExtendsTwo<WrappedPureScope, ScopeArg<typeof scope<WrappedPureScope>>>
    >
  })

  test("rejects wrapped routes with only one method", () => {
    type _Test = Assert<
      IsNever<ScopeArg<typeof scope<WrappedSingleMethodPureScope>>["routes"]>
    >
  })

  test("builds operation tags from declared tags", () => {
    const videosTag = tag({ name: "videos" })
    const channelsTag = tag({
      name: "channels",
      description: "Channel operations",
    })

    expect([...opTags(videosTag, channelsTag)]).toEqual(["videos", "channels"])
  })

  test("accepts only declared tags on operations", () => {
    const videosTag = tag({ name: "videos" })
    const channelsTag = tag({ name: "channels" })
    const tags = opTags(videosTag, channelsTag)

    type _InfersTagNames = Assert<
      IsEqual<typeof tags[number], "channels" | "videos">
    >

    type _AcceptsDeclaredTagOutput = Assert<
      OneExtendsTwo<typeof tags, NonNullable<Op["tags"]>>
    >

    type _RejectsRawStringArrays = Assert<
      IsEqual<OneExtendsTwo<readonly ["videos"], NonNullable<Op["tags"]>>, false>
    >
  })
})
