import type { OptionalKey } from "./dsl.ts"
import type { Nameable } from "./nameable.ts"
import type { Schema } from "./schema.ts"

interface ParamBase {
  name: string
  description?: string
  schema?: Schema
  example?: string
}

export interface QueryParamRaw extends ParamBase {
  in: "query"
  required?: boolean
  style?: "form"
  explode?: boolean
}

export interface PathParamRaw extends ParamBase {
  in: "path"
  required: true
  style?: "simple" | "label" | "matrix"
  explode?: boolean
}

export interface HeaderParamRaw extends ParamBase {
  in: "header"
  required?: boolean
  style?: "simple"
  explode?: boolean
}

export type ParamRaw = QueryParamRaw | PathParamRaw | HeaderParamRaw

/** @dsl */
export type ReusableParam = Nameable<ParamRaw>

export const queryParam = (r: Omit<QueryParamRaw, "in">): QueryParamRaw => ({
  ...r,
  in: "query",
})

export const pathParam = (
  r: Omit<PathParamRaw, "in" | "required">,
): PathParamRaw => ({
  ...r,
  in: "path",
  required: true,
})

export const headerParam = (r: Omit<HeaderParamRaw, "in">): HeaderParamRaw => ({
  ...r,
  in: "header",
})

interface InlineParamBase {
  description?: string
  example?: unknown
  schema: Schema
}

/** @dsl */
export interface InlinePathParam extends InlineParamBase {
  style?: "simple" | "label" | "matrix"
  explode?: boolean
}

/** @dsl */
export interface InlineQueryParam extends InlineParamBase {
  style?: "form"
  explode?: boolean
}

/** @dsl */
export interface InlineHeaderParam extends InlineParamBase {
  style?: "simple"
  explode?: boolean
}

/**
 * Path params are always required to build the path, so names with the "?"
 * suffix are rejected by forcing those keys to `never`
 *
 * @dsl
 */
export interface PathParams extends Record<string, Schema | InlinePathParam> {
  readonly [name: OptionalKey]: never
}
