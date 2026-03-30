import { describe, test } from "vitest"
import type { Assert, IsEqual, IsNever } from "../type-assertions.ts"
import type { Op, OpGET } from "./operation.ts"
import { declareTags } from "./tags.ts"

describe("operation", () => {
  test("only GET operations accept synthetic HEAD ids", () => {
    type _OpRejectsHeadID = Assert<IsNever<Extract<"headID", keyof Op>>>

    type _OpGETAcceptsHeadID = Assert<
      IsEqual<Extract<"headID", keyof OpGET>, "headID">
    >
  })

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
})
