import { describe, expect, test } from "vitest"
import { validate } from "../validate.ts"
import theJSON from "./exceptions.json"
import { exceptionsAPI } from "./exceptions.ts"

describe("exceptions example", () => {
  test("exceptions.json validates as OpenAPI", async () => {
    expect(await validate(exceptionsAPI)).toEqual<typeof theJSON>(theJSON)
  })
})
