import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { normalize } from "./normalize.ts"

describe("normalize", () => {
  test("sorts supported arrays without mutating the original document", () => {
    const doc: oas31.OpenAPIObject = {
      openapi: "3.1.0",
      info: {
        title: "Example",
        version: "1.0.0",
      },
      paths: {},
      "x-strings": ["beta", "alpha", "gamma"],
      "x-numbers": [4, 1, 3, 2],
      "x-bools": [true, false, true, false],
      "x-objects": [
        { name: "beta", tags: ["zeta", "alpha"] },
        { name: "alpha", tags: ["gamma", "beta"] },
      ],
      "x-arrays": [
        ["beta", "alpha"],
        ["delta", "charlie"],
      ],
      // "x-mixed": ["beta", 1, false],
      "x-nested": {
        "x-strings": ["delta", "alpha", "charlie"],
      },
    }

    const normalized = normalize(doc)

    expect(normalized).not.toBe(doc)
    expect(normalized.info).not.toBe(doc.info)
    expect(normalized["x-strings"]).not.toBe(doc["x-strings"])
    expect(normalized["x-objects"]).not.toBe(doc["x-objects"])
    expect(normalized["x-arrays"]).not.toBe(doc["x-arrays"])
    expect(normalized["x-nested"]).not.toBe(doc["x-nested"])

    expect(normalized).toMatchObject({
      "x-strings": ["alpha", "beta", "gamma"],
      "x-numbers": [1, 2, 3, 4],
      "x-bools": [false, false, true, true],
      "x-objects": [
        { name: "alpha", tags: ["beta", "gamma"] },
        { name: "beta", tags: ["alpha", "zeta"] },
      ],
      "x-arrays": [
        ["alpha", "beta"],
        ["charlie", "delta"],
      ],
      // "x-mixed": ["beta", 1, false],
      "x-nested": {
        "x-strings": ["alpha", "charlie", "delta"],
      },
    })

    expect(doc).toMatchObject({
      "x-strings": ["beta", "alpha", "gamma"],
      "x-numbers": [4, 1, 3, 2],
      "x-bools": [true, false, true, false],
      "x-objects": [
        { name: "beta", tags: ["zeta", "alpha"] },
        { name: "alpha", tags: ["gamma", "beta"] },
      ],
      "x-arrays": [
        ["beta", "alpha"],
        ["delta", "charlie"],
      ],
      // "x-mixed": ["beta", 1, false],
      "x-nested": {
        "x-strings": ["delta", "alpha", "charlie"],
      },
    })
  })

  test("treats path-item parameters as equivalent to leading operation parameters", () => {
    const doc: oas31.OpenAPIObject = {
      openapi: "3.1.0",
      info: {
        title: "Example",
        version: "1.0.0",
      },
      paths: {
        "/items/{id}": {
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          get: {
            operationId: "getItem",
            parameters: [
              {
                name: "expand",
                in: "query",
                required: false,
                schema: { type: "string" },
              },
            ],
            responses: {
              200: {
                description: "200",
              },
            },
          },
        },
      },
    }

    expect(normalize(doc)).toEqual<oas31.OpenAPIObject>({
      openapi: "3.1.0",
      info: {
        title: "Example",
        version: "1.0.0",
      },
      paths: {
        "/items/{id}": {
          get: {
            operationId: "getItem",
            parameters: [
              {
                name: "expand",
                in: "query",
                schema: { type: "string" },
              },
              {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "string" },
              },
            ],
            responses: {
              200: {
                description: "200",
              },
            },
          },
        },
      },
    })
  })
})
