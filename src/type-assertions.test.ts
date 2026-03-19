import { describe, test } from "bun:test"
import type { Assert, IsEqual, IsSubtypeOf } from "./type-assertions.ts"

describe("typelevel", () => {
  test("accepts subtype relationships", () => {
    type _LiteralToPrimitive = Assert<IsSubtypeOf<"a", string>>
    type _ObjectExtension = Assert<
      IsSubtypeOf<{ a: string; b: number }, { a: string }>
    >
  })

  test("rejects non-subtype relationships", () => {
    type _PrimitiveToLiteral = Assert<IsEqual<IsSubtypeOf<string, "a">, false>>
    type _UnionToMember = Assert<
      IsEqual<IsSubtypeOf<string | number, string>, false>
    >
  })

  test("accepts identical types", () => {
    type _Primitive = Assert<IsEqual<string, string>>
    type _Object = Assert<
      IsEqual<{ a: string; b: number }, { a: string; b: number }>
    >
    type _Union = Assert<IsEqual<string | number, number | string>>
  })

  test("rejects subtype-only matches", () => {
    type _Broader = Assert<IsEqual<IsEqual<"a", string>, false>>
    type _Narrower = Assert<IsEqual<IsEqual<string, "a">, false>>
  })

  test("rejects distinct shapes", () => {
    type _DifferentProp = Assert<
      IsEqual<
        IsEqual<{ a: string; b: number }, { a: string; b: boolean }>,
        false
      >
    >
  })
})
