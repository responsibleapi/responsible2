import { describe, expect, test } from "vitest"
import type { Assert, IsEqual, IsNever } from "../type-assertions.ts"
import { named } from "./nameable.ts"

type NamedArg<T extends Parameters<typeof named>[1]> = Parameters<
  typeof named<T>
>[1]

describe("nameable", () => {
  test("assigns a component name to value-based definitions", () => {
    const xgafv = named("_.xgafv", {
      in: "query",
      name: "$.xgafv",
    })

    expect(xgafv.name).toBe("_.xgafv")
    expect(xgafv()).toEqual({
      in: "query",
      name: "$.xgafv",
    })
  })

  test("accepts object values", () => {
    type _Test = Assert<
      IsEqual<
        { type: "string"; minLength: 1 },
        NamedArg<{ type: "string"; minLength: 1 }>
      >
    >
  })

  test("rejects thunk-based definitions", () => {
    type _Test = Assert<
      IsNever<NamedArg<() => { type: "string"; minLength: 1 }>>
    >
  })
})
