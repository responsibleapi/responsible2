import type { oas31 } from "openapi3-ts"
import type { RequireAtLeastTwo } from "../lib.ts"
import type { Mime, Resp, Security } from "./methods.ts"
import type { Schema } from "./schema.ts"

interface OpReq {
  security?: Security

  /**
   * optional security means something OR `no authentication`
   */
  "security?"?: Security

  params?: Record<string, Schema>
  query?: Record<string, Schema>
  headers?: Record<string, Schema>
  body?: Schema | Record<Mime, Schema>
}

interface ScopeReq extends OpReq {
  mime?: Mime
}

interface StatusMatch {
  mime: Mime
  headers: Record<string, Schema>
}

type MatchStatus = number | `${number}..${number}`

type OpRes = Record<number, Resp | Schema>

type ScopeRes =
  | {
      mime?: Mime
      match?: Record<MatchStatus, StatusMatch>
      add?: OpRes
    }
  | OpRes

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "HEAD"

export interface Op {
  id?: string
  headID?: string
  req?: OpReq | Schema
  res: OpRes
  deprecated?: boolean
  description?: string
}

export interface OpWithMethod extends Op {
  method: HttpMethod
}

type ScopeOrOp = Op | Scope

export function isScope(s: ScopeOrOp): s is Scope {
  throw new Error(
    "we have not figured out how ScopeOrOp is even constructed to start distinguishing them",
  )
}

/* root level routes, only paths */
type Routes = Record<`/${string}`, ScopeOrOp>

/*
 * Method keys must stay optional because mixed scopes can contain child paths
 * and only one local method. A plain intersection with required method fields
 * would incorrectly demand every HTTP method on every scope.
 */
type MethodRoutes = Partial<Record<HttpMethod, Op>>

/*
 * The stricter "at least two methods" rule only makes sense for pure
 * method-only scopes. Once a scope also has nested `"/child"` routes, we allow
 * partial method sets so parent scopes can mix handlers with subpaths.
 */
type PureMethodRoutes = RequireAtLeastTwo<Record<HttpMethod, Op>>

/*
 * Real `routes` objects can contain both HTTP methods and nested path keys at
 * the same time, so this is a combined shape instead of a simple union.
 */
type ScopeRoutes = Routes & MethodRoutes

/*
 * `scope()` accepts either the bare routes object or the full `{ routes,
 * forAll? }` wrapper.
 */
type ScopeArg = ScopeRoutes | Scope

/*
 * A simple `Routes & PureMethodRoutes` would reject mixed scopes entirely,
 * while `Routes & MethodRoutes` alone would allow single-method scopes through.
 * This conditional keeps mixed scopes valid and only enforces
 * `RequireAtLeastTwo` when there are no path keys at all.
 */
type ValidScopeRoutes<T extends ScopeRoutes> =
  Extract<keyof T, `/${string}`> extends never
    ? T extends PureMethodRoutes
      ? T
      : never
    : T

/*
 * The same validation needs to work for both `scope({ GET: ... })` and
 * `scope({ routes: { GET: ... } })`, so we reapply `ValidScopeRoutes` to the
 * nested `routes` property in the wrapped form.
 */
type ValidScopeArg<T extends ScopeArg> = T extends Scope
  ? Omit<T, "routes"> & { routes: ValidScopeRoutes<T["routes"] & ScopeRoutes> }
  : T extends ScopeRoutes
    ? ValidScopeRoutes<T>
    : never

interface ScopeOpts {
  req?: ScopeReq
  res?: ScopeRes
}

interface ResponsibleAPI {
  partialDoc: Partial<Omit<oas31.OpenAPIObject, "components">>
  forAll: ScopeOpts
  routes: Routes
}

export function responsibleAPI(_api: ResponsibleAPI): oas31.OpenAPIObject {
  throw new Error("TODO")
}

interface Scope {
  forAll?: ScopeOpts
  routes: ScopeRoutes
}

export function scope<const T extends ScopeArg>(arg: ValidScopeArg<T>): Scope {
  if ("routes" in arg) {
    return arg
  }

  return {
    routes: arg,
  }
}

function _scopeToPaths(_: Scope): oas31.PathsObject {
  throw new Error("not even sure if we need this function")
}
