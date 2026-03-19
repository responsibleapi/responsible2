import { describe, test } from "vitest"
import type { RequireAtLeastTwo } from "./lib.ts"
import type { Assert, IsSubtypeOf, IsNever } from "./type-assertions.ts"

type Example = {
  a: string
  b: number
  c: boolean
}

describe("RequireAtLeastTwo", () => {
  test("accepts objects with at least two properties", () => {
    type _ExactTwo = Assert<
      IsSubtypeOf<{ a: string; b: number }, RequireAtLeastTwo<Example>>
    >

    type _AllThree = Assert<
      IsSubtypeOf<
        { a: string; b: number; c: boolean },
        RequireAtLeastTwo<Example>
      >
    >
  })

  test("rejects objects with fewer than two properties", () => {
    type _Single = Assert<
      IsNever<Extract<{ a: string }, RequireAtLeastTwo<Example>>>
    >

    type _Empty = Assert<
      IsNever<Extract<Record<never, never>, RequireAtLeastTwo<Example>>>
    >
  })
})
