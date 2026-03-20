import { describe, expect, test } from "vitest"
import { named } from "./nameable.ts"

describe("named", () => {
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

  test("preserves thunk-based definitions for lazy values", () => {
    const schema = named("VideoID", () => ({ type: "string", minLength: 1 }))

    expect(schema.name).toBe("VideoID")
    expect(schema()).toEqual({
      type: "string",
      minLength: 1,
    })
  })
})
