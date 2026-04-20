import type { oas31 } from "openapi3-ts"
import type { AtLeastOne, AtLeastTwo } from "../lib.ts"
import type { HttpMethod, MethodRoutes } from "./methods.ts"
import type {
  MatchStatus,
  Op,
  OpBase,
  OpResponses,
  ReqAugmentation,
  RespAugmentation,
} from "./operation.ts"
import type { PathParams, ReusableParam } from "./params.ts"
import type { DeclaredTags, OpTags } from "./tags.ts"

export type Mime = `${string}/${string}`

type ScopeResAugmentation = NonNullable<
  AtLeastOne<{
    mime?: Mime
    defaults?: Record<MatchStatus, RespAugmentation>
    add?: OpResponses
  }>
>

type ScopeResShape = ScopeResAugmentation | OpResponses

/**
 * This validates a concrete scope-level response object. The default keeps the
 * public DSL surface broad, while specific inputs can collapse to `never` when
 * they are neither a response augmentation object nor a numeric status map.
 */
export type ScopeRes<T extends object = ScopeResShape> =
  T extends ScopeResAugmentation
    ? T
    : keyof T extends never
      ? never
      : Exclude<keyof T, number> extends never
        ? T
        : never

export type HttpPath = `/${string}`

export type ScopeOrOp<TTags extends DeclaredTags = DeclaredTags> =
  | OpBase<TTags>
  | Scope<TTags>

/** For root level; only {@link HttpPath} keys */
export type PathRoutes<TTags extends DeclaredTags = DeclaredTags> = Record<
  HttpPath,
  ScopeOrOp<TTags>
>

export interface ForEachPath {
  readonly params?: readonly ReusableParam[]
  readonly pathParams?: PathParams
}

export interface Scope<TTags extends DeclaredTags = DeclaredTags>
  extends MethodRoutes<TTags>,
    Partial<PathRoutes<TTags>>,
    ForEachPath {
  readonly forEachOp?: ScopeOpts<TTags>
  readonly forEachPath?: ForEachPath
}

export interface ScopeOpts<TTags extends DeclaredTags = DeclaredTags> {
  req?: ReqAugmentation
  res?: ScopeRes
  tags?: OpTags<TTags>
}

/**
 * Scopes without nested paths are pure method collections, so require at least
 * two HTTP methods in that branch.
 *
 * `forEachOp` is ignored here so defaults do not affect the route-shape
 * validation. For single methods, use DSL from {@link file://../methods.ts}
 *
 * If a scope has at least one nested path, it is valid as-is. Otherwise we
 * validate only the method subset.
 *
 * @dsl
 */
type ValidScopeArg<T extends Scope> =
  Extract<keyof T, HttpPath> extends never
    ? Pick<T, Extract<keyof T, HttpMethod>> extends AtLeastTwo<
        Record<HttpMethod, Op>
      >
      ? T
      : never
    : T

/**
 * Use this when declaring multiple routes under the same subpath. For single
 * methods, use DSL from {@link file://../methods.ts}
 *
 * Scope merge behavior:
 *
 * `forEachOp` is inherited by every nested route and scope.
 *
 * - `req` is additive: parent defaults provide shared mime, params, security, and
 *   request fields, while children extend or narrow them locally.
 * - `tags` are inherited from the nearest containing scope.
 * - `res.defaults` augments matching response ranges, for example to add shared
 *   mime or headers to every `2xx` or `4xx` response.
 * - `res.add` injects whole response entries into each child operation.
 * - If an operation already declares the same status code locally, keep that
 *   response local for now. In practice, `forEachOp.res.add.200` is for
 *   sibling operations that do not already define their own `200`.
 *
 * The `const` type parameter preserves literal method and path keys so the
 * type-level route validation runs before those keys widen to generic strings.
 *
 * @dsl
 */
export function scope<T extends Scope>(arg: ValidScopeArg<T>): Scope {
  return arg
}

export function isScope<TTags extends DeclaredTags>(
  s: ScopeOrOp<TTags>,
): s is Scope<TTags> {
  return (
    typeof s === "object" &&
    s !== null &&
    !("method" in s) &&
    Object.keys(s).some(
      key =>
        key === "forEachOp" ||
        key === "forEachPath" ||
        key.startsWith("/") ||
        key === "GET" ||
        key === "POST" ||
        key === "PUT" ||
        key === "DELETE" ||
        key === "HEAD",
    )
  )
}

function _scopeToPaths(_: Scope): oas31.PathsObject {
  throw new Error("not even sure we need this function")
}
