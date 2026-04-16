import { describe, expect, test } from "vitest"
import { validate } from "../help/validate"
import theJSON from "./pachca.json"

describe("pachca", () => {
  test("pachca.json is valid", async () => {
    expect(await validate(theJSON)).toEqual(theJSON)
  })
})
