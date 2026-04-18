import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { normalize } from "../help/normalize.ts"
import { validateDoc } from "../help/validate-doc.ts"
import theJSON from "./pachca.json"
import theAPI from "./pachca.ts"

describe("pachca", () => {
  test("json is valid", async () => {
    expect(await validateDoc(theJSON)).toEqual(theJSON)
  })

  test("compiles to json", async () => {
    expect(normalize(await validateDoc(theAPI))).toEqual(
      normalize(theJSON as oas31.OpenAPIObject),
    )
  })
})
