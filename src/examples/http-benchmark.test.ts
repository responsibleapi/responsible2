import { describe, expect, test } from "vitest"
import { validate } from "../validate.ts"
import theJSON from "./http-benchmark.json"
import { httpBenchmarkAPI } from "./http-benchmark.ts"

describe("exceptions example", () => {
  test("exceptions.json validates as OpenAPI", async () => {
    expect(await validate(httpBenchmarkAPI)).toEqual<typeof theJSON>(theJSON)
  })
})
