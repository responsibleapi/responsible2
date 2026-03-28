import type { NameWithOptionality } from "./dsl.ts"
import type { HttpMethod } from "./methods.ts"
import type { Nameable } from "./nameable.ts"
import type { Param } from "./params.ts"
import type { Schema } from "./schema.ts"
import type { Mime } from "./scope.ts"
import type { Security } from "./security.ts"
import type { OpTags, TagRegistry } from "./tags.ts"

export interface OpReq {
  readonly security?: Security
  /* optional security means `value` OR `no authentication` */
  readonly "security?"?: Security
  readonly pathParams?: Record<NameWithOptionality, Schema>
  readonly query?: Record<NameWithOptionality, Schema>
  readonly headers?: Record<NameWithOptionality, Schema>
  readonly body?: Schema | Record<Mime, Schema>

  /**
   * helps reuse params. We could reuse them in {@link query} etc.
   * using object spreading, but I don't like
   * hidden `name` and `required` in {@link NameWithOptionality} during reuse.
   * TBD.
   *
   * @dsl
   */
  readonly params?: readonly Param[]
}

export interface ReqAugmentation extends OpReq {
  readonly mime?: Mime
}

export interface RespAugmentation {
  readonly mime?: Mime
  readonly headers?: Record<string, Schema>
  readonly cookies?: Record<string, Schema>
}

export type MatchStatus = number | `${number}..${number}`

export interface RespParams {
  body?: Schema | Record<Mime, Schema>
  description?: string
  headers?: Record<string, Schema>
  cookies?: Record<string, Schema>
}

export type Resp = Nameable<RespParams>

export type OpRes = Record<number, Resp | Schema>

export interface Op<TTags extends TagRegistry = TagRegistry> {
  id?: string
  headID?: string
  req?: OpReq | Schema
  res?: OpRes
  deprecated?: boolean
  description?: string
  summary?: string
  tags?: OpTags<TTags>
}

export interface OpWithMethod<
  TTags extends TagRegistry = TagRegistry,
> extends Op<TTags> {
  method: HttpMethod
}

/** this exists mostly to distinguish {@link Schema} from {@link Resp} */
export const resp = (param: RespParams): RespParams => param
