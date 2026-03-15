// TODO: Merge this file into `src/dsl/dsl.ts`.

import type { Route } from "./dsl.ts"
import type { Schema } from "./schema.ts"

type NonFunctionValue =
  | bigint
  | boolean
  | null
  | number
  | object
  | string
  | symbol
  | undefined

/**
 * either named reference in `#components/` or an actual inline thing
 */
export type Nameable<T extends NonFunctionValue> = (() => T) | T

function isNamed<T extends NonFunctionValue>(n: Nameable<T>): n is () => T {
  return typeof n === "function"
}

function _decodeNameable<T extends NonFunctionValue>(
  n: Nameable<T>,
): { name?: string; value: T } {
  if (isNamed(n)) {
    return { name: n.name, value: n() }
  }

  return { value: n }
}

export type Mime = `${string}/${string}`

interface RespParams {
  body?: Schema | Record<Mime, Schema>
  description?: string
  headers?: Record<string, Schema>
  cookies?: Record<string, Schema>
}

export type Resp = Nameable<RespParams>

export const response = (param: RespParams): RespParams => param

type QuerySecurity = Readonly<{
  type: "query"
  name: string
}>

type HeaderSecurity = Readonly<{
  type: "header"
  name: string
}>

export type Security = Nameable<QuerySecurity | HeaderSecurity>

export const querySecurity = (param: { name: string }): QuerySecurity => ({
  type: "query",
  ...param,
})

export const headerSecurity = (param: { name: string }): HeaderSecurity => ({
  type: "header",
  ...param,
})

type Path = `/${string}`

const isPath = (x: unknown): x is Path =>
  typeof x === "string" && x.startsWith("/")

export function path(
  strings: TemplateStringsArray,
  ...params: readonly Schema[]
): [Path, Record<string, Schema>] {
  const [pathStart] = strings

  if (!isPath(pathStart)) {
    throw new Error(`${pathStart ?? "path"} must start with /`)
  }

  void params
  throw new Error("TODO")
}

export function GET(_op: Route): Route {
  throw new Error("TODO")
}

export function POST(op: Route): Route
export function POST(id: string, op: Route): Route
export function POST(_idOrOp: string | Route, _maybeOp?: Route): Route {
  throw new Error("TODO")
}
