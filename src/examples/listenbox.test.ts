import { describe, expect, test } from "bun:test"
import { validate } from "../validate.ts"
import listenboxJSON from "./listenbox.json"
import { listenboxAPI } from "./listenbox.ts"

describe("listenbox example", () => {
  test("listenbox.json validates as OpenAPI", async () => {
    expect(await validate(listenboxAPI)).toEqual<typeof listenboxJSON>(
      listenboxJSON,
    )
  })
})
