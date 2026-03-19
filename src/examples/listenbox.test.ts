import { describe, expect, test } from "vitest"
import { validate } from "../validate.ts"
import json from "./listenbox.json"
import api from "./listenbox.ts"

describe("listenbox example", () => {
  test("listenbox.json validates as OpenAPI", async () => {
    expect(await validate(api)).toEqual<typeof json>(json)
  })
})
