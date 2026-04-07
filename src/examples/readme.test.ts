import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { normalize } from "../help/normalize.ts"
import { validate } from "../help/validate.ts"
import theJSON from "./readme.json"
import readmeAPI from "./readme.ts"

describe("readme example", () => {
  test("readme.json is valid", async () => {
    expect(await validate(theJSON)).toEqual(theJSON)
  })

  test("readmeAPI compiles to readme.json", async () => {
    expect(normalize(await validate(readmeAPI))).toEqual(
      normalize(theJSON as oas31.OpenAPIObject),
    )
  })
})
