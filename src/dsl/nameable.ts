type NonFunction =
  | bigint
  | boolean
  | null
  | number
  | object
  | string
  | symbol
  | undefined

/**
 * this is pretty much core of this DSL. {@link Function.name} is used as
 * $ref in OpenAPI "#/components/.../$name", otherwise the value is inlined
 */
export type Nameable<T extends NonFunction> = (() => T) | T

/**
 * `Nameable<T>` allows lazy thunks, but `named()` should only wrap concrete
 * values. Callable inputs are therefore rejected by collapsing them to `never`.
 */
type NamedValue<T extends NonFunction> = T extends (...args: any[]) => unknown
  ? never
  : T

/**
 * Use this for component keys that are not valid TypeScript identifiers,
 * for example `named("_.xgafv", queryParam(...))`.
 */
export const named = <T extends NonFunction>(
  componentName: string,
  value: NamedValue<T>,
): (() => T) =>
  Object.defineProperty(() => value, "name", {
    configurable: true,
    value: componentName,
  })

const isNamed = <T extends NonFunction>(n: Nameable<T>): n is () => T =>
  typeof n === "function"

function _decodeNameable<T extends NonFunction>(
  n: Nameable<T>,
): { name?: string; value: T } {
  if (isNamed(n)) {
    return { name: n.name, value: n() }
  }

  return { value: n }
}
