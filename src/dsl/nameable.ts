import type { oas31 } from "openapi3-ts"

/**
 * Scalars are inlined as is in OpenAPI doc
 *
 * @dsl
 */
type Scalar<T> = T extends (...args: unknown[]) => unknown ? never : T

/**
 * OpenAPI {@link oas31.ReferenceObject} fields other than `$ref` (e.g.
 * `summary`, `description`), aligned with openapi3-ts types.
 */
export type RefWithoutRef = Omit<oas31.ReferenceObject, "$ref">

/**
 * In DSL positions that accept {@link Nameable}, passing a {@link NamedThunk}
 * emits an OpenAPI `{ "$ref": "#/components/<T>/<name>" }`, where `<name>`
 * comes from {@link Function.name}.
 *
 * Optional {@link RefWithoutRef} siblings (`summary`, `description`) may be set
 * via {@link ref}; they are meaningful when the compiler emits `$ref`
 * (follow-up).
 *
 * Never call the thunk, always pass the reference
 *
 * @dsl
 */
export type NamedThunk<T> = [Scalar<T>] extends [never]
  ? never
  : { (): Scalar<T>; name: string } & RefWithoutRef

export type Nameable<T> = NamedThunk<T> | Scalar<T>

function getRefSibling(
  target: object,
  key: "summary" | "description",
): string | undefined {
  const d = Object.getOwnPropertyDescriptor(target, key)
  if (d === undefined) {
    return undefined
  }
  const v = d.value
  return typeof v === "string" ? v : undefined
}

function mergeRefPartial(
  inner: object,
  fields: Partial<RefWithoutRef>,
): RefWithoutRef {
  const summary = Object.prototype.hasOwnProperty.call(fields, "summary")
    ? fields.summary
    : getRefSibling(inner, "summary")

  const description = Object.prototype.hasOwnProperty.call(
    fields,
    "description",
  )
    ? fields.description
    : getRefSibling(inner, "description")

  const out: RefWithoutRef = {}
  if (summary !== undefined) {
    out.summary = summary
  }
  if (description !== undefined) {
    out.description = description
  }
  return out
}

/**
 * Creates a named thunk for component reuse in DSL positions that accept
 * {@link Nameable}. Pass the returned thunk itself when you want a `$ref`.
 *
 * Reference siblings (`summary`, `description`) are left unset; use {@link ref}
 * to attach them.
 */
export const named = <T>(name: string, value: Scalar<T>): NamedThunk<T> => {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion
  const thunk = (() => value) as NamedThunk<T>

  thunk.name = name

  return thunk
}

/**
 * Wraps a {@link NamedThunk} with merged OpenAPI reference siblings. The
 * returned thunk forwards `()` to the inner thunk and copies
 * {@link Function.name}. For each sibling, an own property on {@link fields}
 * wins; otherwise the value is inherited from the inner thunk.
 */
export const ref = <T>(
  thunk: NamedThunk<T>,
  fields: Partial<RefWithoutRef>,
): NamedThunk<T> => {
  const merged = mergeRefPartial(thunk, fields)
  // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion
  const wrapper = (() => thunk()) as NamedThunk<T>

  wrapper.name = thunk.name

  if (merged.summary !== undefined) {
    wrapper.summary = merged.summary
  }
  if (merged.description !== undefined) {
    wrapper.description = merged.description
  }

  return wrapper
}

const isNamed = <T>(n: Nameable<T>): n is NamedThunk<T> =>
  typeof n === "function"

type DecodedNameable<T> = {
  name?: string
  value: Scalar<T>
  summary?: string
  description?: string
}

export function decodeNameable<T>(n: Nameable<T>): DecodedNameable<T> {
  if (!isNamed(n)) {
    return { value: n }
  }

  const summary = getRefSibling(n, "summary")
  const description = getRefSibling(n, "description")
  const out: DecodedNameable<T> = { name: n.name, value: n() }
  if (summary !== undefined) {
    out.summary = summary
  }
  if (description !== undefined) {
    out.description = description
  }
  return out
}
