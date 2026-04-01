import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { normalize } from "../help/normalize.ts"
import { validate } from "../help/validate.ts"
import theJSON from "./http-benchmark.json"
import httpBenchmarkAPI from "./http-benchmark.ts"

describe("http-benchmark example", () => {
  test("http-benchmark.json validates as OpenAPI", async () => {
    expect(await validate(theJSON)).toEqual(theJSON)
  })

  test("httpBenchmarkAPI matches http-benchmark.json", async () => {
    expect(normalize(await validate(httpBenchmarkAPI))).toEqual(
      normalize(theJSON as oas31.OpenAPIObject),
    )
  })
})
