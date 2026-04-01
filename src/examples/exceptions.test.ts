import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { normalize } from "../help/normalize.ts"
import { validate } from "../help/validate.ts"
import theJSON from "./exceptions.json"
import { exceptionsAPI } from "./exceptions.ts"

describe("exceptions example", () => {
  test("exceptions.json validates as OpenAPI", async () => {
    expect(normalize(await validate(exceptionsAPI))).toEqual(
      normalize(theJSON as oas31.OpenAPIObject),
    )
  })
})
