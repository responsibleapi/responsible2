/**
 * OpenAPI lets some schema-adjacent fields live both on schema itself and on
 * place where schema gets used. Parameters and headers, for example, carry
 * their own `description` / `example` fields while also embedding a `schema`.
 *
 * This file centralizes "schema use-site" handling: - read use-site metadata
 * from DSL wrappers before schema compilation - move that metadata onto
 * containing OpenAPI object when needed - strip duplicated fields from emitted
 * schema object afterward
 *
 * Without this layer compiler would repeat same extraction logic across request
 * and response paths, and would risk emitting duplicated or wrong-level
 * `description` / `example` data.
 */

import { decodeNameable } from "../dsl/nameable.ts"
import type { RawSchema, Schema } from "../dsl/schema.ts"
import type { EmittedSchema } from "./emit-schema.ts"

const schemaDescription = (schema: RawSchema): string | undefined =>
  typeof schema === "object" &&
  schema !== null &&
  typeof (schema as { description?: unknown }).description === "string"
    ? ((schema as { description?: string }).description ?? undefined)
    : undefined

const schemaExample = (schema: RawSchema): unknown => {
  if (typeof schema !== "object" || schema === null) {
    return undefined
  }

  const boxed = schema as {
    example?: unknown
    examples?: readonly unknown[]
  }

  if (Array.isArray(boxed.examples) && boxed.examples[0] !== undefined) {
    return boxed.examples[0]
  }

  return boxed.example
}

export const getSchemaUseDescription = (schema: Schema): string | undefined => {
  const decoded = decodeNameable(schema)

  return decoded.description ?? schemaDescription(decoded.value)
}

export const getSchemaUseExample = (schema: Schema): unknown => {
  const decoded = decodeNameable(schema)

  return schemaExample(decoded.value)
}

export const stripSchemaUsageFields = (
  schema: EmittedSchema,
  opts: {
    description?: boolean
    example?: boolean
  },
): EmittedSchema => {
  if (!opts.description && !opts.example) {
    return schema
  }

  const out = { ...schema } as Record<string, unknown>

  if (opts.description) {
    delete out["description"]
  }

  if (opts.example) {
    delete out["example"]
    delete out["examples"]
  }

  return out as EmittedSchema
}
