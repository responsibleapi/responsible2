import { describe, expect, test } from "vitest"
import { validate } from "../validate.ts"
import exceptionsJSON from "./exceptions.json"
import { exceptionsAPI } from "./exceptions.ts"

describe("exceptions example", () => {
  test("exceptions.json validates as OpenAPI", async () => {
    expect(await validate(exceptionsAPI)).toEqual<typeof exceptionsJSON>(
      exceptionsJSON,
    )
  })
})
