import { describe, expect, test } from "bun:test"
import type { oas31 } from "openapi3-ts"
import { validate } from "../validate.ts"
import { listenboxAPI } from "./listenbox.ts"
import listenboxOpenAPI from "./listenbox.yaml" assert { type: "yaml" }

describe("listenbox example", () => {
  test("listenbox.yaml validates as OpenAPI", async () => {
    // ESLint treats the YAML import as an error-typed value when passed directly
    // to `toEqual`, so we pin the intended OpenAPI type in a local first.
    const expected: oas31.OpenAPIObject = listenboxOpenAPI

    expect(await validate(listenboxAPI)).toEqual(expected)
  })
})
