import { describe, test } from "vitest"
import type { Assert, IsEqual, IsNever } from "../type-assertions.ts"
import type { Op } from "./operation.ts"
import { declareTags } from "./tags.ts"

describe("operation", () => {
  test("accepts declared tags on operations", () => {
    const tags = declareTags({
      videos: {},
      channels: {},
    } as const)

    type _Test = Assert<
      IsEqual<
        NonNullable<Op<typeof tags>["tags"]>,
        readonly (typeof tags.videos | typeof tags.channels)[]
      >
    >
  })

  test("rejects inline tag objects on operations", () => {
    const tags = declareTags({
      videos: {},
    } as const)

    type _Test = Assert<
      IsNever<
        Extract<
          { readonly name: "videos" },
          NonNullable<Op<typeof tags>["tags"]>[number]
        >
      >
    >
  })
})
